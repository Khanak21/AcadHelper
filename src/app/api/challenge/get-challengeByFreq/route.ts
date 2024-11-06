interface Params {
    id: string;
}
import Challenge from "@/models/challengeModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { frequency, userId } = await request.json();
        if(frequency !='daily' && frequency !='weekly'){
            return NextResponse.json({
                success: false,
                message: "Invalid frequency provided."
            }, { status: 400 });
        }

        const user = await User.findById(userId).populate('Courses');

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            }, { status: 404 });
        }

        const challenges = await Challenge.find({
            courseId: { $in: user.Courses.courseId },
            frequency: frequency
        });
        return NextResponse.json({
            success: true,
            data: challenges,
        });
    } catch (error: any) {
        console.error("Error fetching challenges:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch challenges.",
            error: error.message,
        }, { status: 500 });
    }
}