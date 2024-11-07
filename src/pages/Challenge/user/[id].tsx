import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Challenge from "@/Interfaces/challenge";
import Submission from "@/Interfaces/submission";
import '../../../app/globals.css';
import toast, { Toaster } from 'react-hot-toast';
// import { Modal, Button, Form } from 'react-bootstrap';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import { useStore } from "@/store";
import { CldUploadWidget } from 'next-cloudinary';
interface EditChallenge {
  title: string;
  description: string;
  challengeDoc?: string;
  type: "individual" | "team";
  frequency: "daily" | "weekly";
  startDate: Date;
  points: number;
}

const ChallengeDetails: React.FC = () => {
  const router = useRouter();
  const { query } = router
  console.log(query)
  const { user, setUser } = useStore()
  const { id } = router.query;
  const [challengeDoc, setchallengeDoc] = useState("")
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [yo, setyo] = useState(false);
  const [show, setShow] = useState(false)
  const [errorMessage, setErrorMessage] = useState("");
  const [isDocVisible, setIsDocVisible] = useState<boolean>(false);
  const [editedchallenge, seteditedchallenge] = useState<EditChallenge | null>(null);
  console.log(id)
  const challengeId = typeof id === 'string' ? id : '';
  useEffect(() => {
    if (challengeId) {
      const fetchChallenge = async () => {
        try {
          const response = await axios.get(`/api/challenge/getchallengeById?Id=${challengeId}`);
          setChallenge(response.data.data);
        } catch (error) {
          console.error("Error fetching challenge details:", error);
        }
      };
      fetchChallenge();
    }
  }, [challengeId]);

  useEffect(() => {
    if (challengeId) {
        const fetchSubmissions = async () => {
            try {
                const submissionsResponse = await axios.get(`/api/submission/getsubmissionbychallengeanduser?challengeId=${challengeId}&userId=${user._id}`);
                setSubmissions(submissionsResponse.data.data);
                console.log(submissionsResponse)
            } catch (error) {
                console.error("Error fetching submissions:", error);
            }
        };
        fetchSubmissions();
    }
}, [challengeId, yo]);

  const handleClose = () => {
    setShow(false);
    setErrorMessage('')
  }

  const handleShow = () => {
    setShow(true);
    console.log(challenge)
    seteditedchallenge({
      title: challenge?.title || "",
      description: challenge?.description || "",
      challengeDoc: challenge?.challengeDoc || "",
      type: challenge?.type || "team",
      frequency: challenge?.frequency || "daily",
      startDate: challenge?.startDate || new Date(),
      points: challenge?.points || 0
    })
  }

  const deletesub = async (id: string) => {
    try {
      const response = await axios.patch(`/api/submission/remove-submission?Id=${id}`);
      console.log(response.data)
      setyo(!yo);
    }
    catch (e: any) {
      console.error("Error while removing:", e);
    }
  }

  const handleEditsub= async (id: string) => {
    const submitwala = {
        documentLink: challengeDoc
    }
    try {
        const response = await axios.patch(`/api/submission/edit-submission?Id=${id}`, submitwala);
        console.log(response.data)
        setchallengeDoc("")
        setIsDocVisible(false);
        setyo(!yo);
    }
    catch (e: any) {
        console.error("Error while removing:", e);
    }
}

const handlesub = async () => {
  const submitwala = {
      user: user._id,
      challenge: challengeId,
      documentLink: challengeDoc,
      Course:challenge?.courseId
  }
  try {
      const response = await axios.post('/api/submission', submitwala);
      console.log(response.data)
      setchallengeDoc("")
      setIsDocVisible(false);
      setyo(!yo);
  }
  catch (e: any) {
      console.error("Error while removing:", e);
  }
}

const handleUpload = (result: any) => {
  if (result && result.info) {
      setchallengeDoc(result.info.url)
      setIsDocVisible(true);
      console.log("Upload result info:", result.info);
  } else {
      console.error("Upload failed or result is invalid.");
  }
};

  if (!challenge) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10 px-5">
      <div>
        <div className="flex justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-center">{challenge.title}</h1>
            <p className="text-gray-700 text-center">{challenge.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="mb-4">
              <span className="font-semibold">Type:</span> {challenge.type}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Frequency:</span> {challenge.frequency}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Points:</span> {challenge.points}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Start Date:</span> {new Date(challenge.startDate).toLocaleDateString()}
            </div>
            <div className="mb-4">
              <span className="font-semibold">End Date:</span> {new Date(challenge.endDate).toLocaleDateString()}
            </div>
            {challenge.challengeDoc && (
              <div className="mb-4">
                <span className="font-semibold">Challenge Document:</span>{" "}
                <a href={challenge.challengeDoc} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  View Document
                </a>
              </div>
            )}
          </div>
        </div>
        <button
                    onClick={() => (submissions.length > 0 ? handleEditsub(submissions[0]._id) : handlesub())}
                    className="mb-4 ml-4 mr-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    {submissions.length > 0 ? "Edit Submission" : "Submit Challenge"}
                </button>
                <CldUploadWidget uploadPreset="acad_helper_pdf" onSuccess={handleUpload}>
                    {({ open }) => (
                        <Button className="mt-4" onClick={() => open()} variant="outlined" color="primary">
                            Select File
                        </Button>
                    )}
                </CldUploadWidget>
                {isDocVisible && challengeDoc && (
                    <div>
                        <a href={challengeDoc} className="text-blue-500 " target="_blank" rel="noopener noreferrer">
                            View Uploaded Document
                        </a>
                    </div>
                )}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Submissions</h2>
                    {submissions.length > 0 ? (
                        submissions.map((submission) => (
                            <div key={submission._id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        {/* <p><strong>Submitted By:</strong> {submission.user.name}</p> */}
                                        <p><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                                    </div>
                                    <a href={submission.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        View Submission
                                    </a>
                                    <Button onClick={()=>{deletesub(submission._id)}}>Delete submission</Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No submissions yet.</p>
                    )}
                </div>
        <button
          onClick={() => router.push(`/user/Courses`)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Challenges
        </button>

      </div>
    </div>
  );
};

export default ChallengeDetails;