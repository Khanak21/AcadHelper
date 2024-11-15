import mongoose from "mongoose";

export interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  password: string;
  Courses: string[];
  CoursesAsAdmin: string[];
  challengessolved: string[];
  completedAssignments: string[];
  pendingAssignments: string[];
  pendingInvites: string[];
  submissions: string[];
  tasks: string[];
  teams: string[];
  createdAt: string;
  updatedAt: string;
  inbox: [Object]
  __v: number;
  Totalpoints:{courseId:mongoose.Schema.Types.ObjectId,points:Number}
}


export default User;
