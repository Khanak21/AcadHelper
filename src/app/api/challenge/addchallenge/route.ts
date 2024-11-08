import Challenge from "@/models/challengeModel";
import Course from "@/models/courseModel";
import { NextRequest,NextResponse} from "next/server";
import {connect} from '@/dbConfig/dbConfig'
connect()

export async function POST(request: NextRequest) {
    try {
        const {newChallengeData} = await request.json()
        const {title,description,type,frequency,challengeDoc,endDate,startDate,points,createdBy,courseId}= newChallengeData
        if(!courseId){
            return NextResponse.json({
                success: false,
                message: "Invalid Course Id",
            }, { status: 400 });
        }
        const course = await Course.findById(courseId)
        if(!course){
            return NextResponse.json({
                success: false,
                message: "Invalid Course",
            }, { status: 404 });
        }
        if (!title || !description || !type || !startDate || !endDate||!points || !createdBy||!courseId||!frequency ||!challengeDoc) {
            return NextResponse.json({
                success: false,
                message: "All fields are required.",
            }, { status: 400 });
        }
        const newChallenge = new Challenge(newChallengeData)
        const savedChallenge = await newChallenge.save();
        const updatedcourse = await Course.findByIdAndUpdate(courseId,{$push:{challenges:savedChallenge._id}},{new:true});
        return NextResponse.json({
            success: true,
            message: "Challenge created successfully",
            data: savedChallenge,
        });
    } catch (error: any) {
        console.error("Error creating challenge:", error);
        return {
            success: false,
            message: "Failed to create challenge",
            error: error.message,
        };
    }
}
