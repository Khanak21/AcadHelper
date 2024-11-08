import { connect } from '@/dbConfig/dbConfig'
import Assignment from '@/models/assignmentModel'
import Course from '@/models/courseModel'
import User from '@/models/userModel'
import Submission from '@/models/submissionModel'
import Challenge from '@/models/challengeModel'
import { NextResponse } from 'next/server'
import { Group } from 'lucide-react'
import Team from '@/models/teamModel'
connect()

// Approve a submission
export const PATCH = async (request:Request)=>{
    try {
        const url = new URL(request.url);
        const submissionId = url.searchParams.get('Id');
        const {deduct} = await request.json()
        if(!submissionId)
        {
            return new NextResponse(JSON.stringify({message:"Enter all the credentials"}),{status:404})
        }
        const findSubmission=await Submission.findById(submissionId)

        if(!findSubmission)
        {
            return new NextResponse(JSON.stringify({message:"Submission doesn't exist"}))
        }
        if(findSubmission.isVerified===false){
            return new NextResponse(JSON.stringify({message:"Already approved"}))
        }
        let points = 0;
        let courseId;
        if (findSubmission.Challenge) {
            const challenge = await Challenge.findById(findSubmission.Challenge);
            courseId = challenge.courseId;
        } else if (findSubmission.Assignment) {
            const assignment = await Assignment.findById(findSubmission.Assignment);
            courseId = assignment.Course;
        }
        findSubmission.marksObtained-=deduct

        if (findSubmission.type === "team") {
            const team = await Team.findById(findSubmission.groupId);
            if (team) {
                const members = team.Members.map((member:any) => member.memberId);
                const pointsPerMember = deduct / members.length;
                for (const memberId of members) {
                    const user = await User.findById(memberId);
                    const courseIndex = user.Totalpoints.findIndex(
                        (entry: any) => entry.courseId.equals(courseId)
                    );
                    if (courseIndex >= 0 && user.Totalpoints[courseIndex]) {
                        user.Totalpoints[courseIndex].points -= deduct;
                    } else {
                        user.Totalpoints.push({ courseId, points: 0 });
                    }
                    await user.save();
                }
            }
        } else {
            const user = await User.findById(findSubmission.User);
            const courseIndex = user.Totalpoints.findIndex(
                (entry: any) => entry.courseId.equals(courseId)
            );
            if (courseIndex >= 0) {
                user.Totalpoints[courseIndex].points -= deduct;
            }
            await user.save();
        }
        await findSubmission.save()
        
        return new NextResponse(JSON.stringify({message:"Successfully bonus points given",submission:findSubmission}),{status:200})

    } catch (error:any) {
        console.log(error)
        return new NextResponse(JSON.stringify({message:"Error while giving bonus points",error:error}),{status:500})
    }
}

