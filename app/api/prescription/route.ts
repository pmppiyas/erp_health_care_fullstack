import { NextRequest, NextResponse } from "next/server"
import { withAuthAndValidation } from "@/middleware/withAuthAndValidation"
import { withAuth } from "@/middleware/withAuth"
import { Role } from "@/app/api/user/user.interface"
import Prescription from "./prescription.model"
import Doctor from "@/app/api/doctor/doctor.model"
import {
  createPrescriptionValidationSchema,
  CreatePrescriptionInput,
} from "./prescription.validation"
import { StatusCodes } from "http-status-codes"
import { sendResponse } from "@/lib/utils/sendResponse"

export const POST = withAuthAndValidation(
  createPrescriptionValidationSchema,
  [Role.DOCTOR],
  async (req, context, user, data: CreatePrescriptionInput) => {

    const doctor = await Doctor.findOne({ userId: user.id })
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor profile not found" },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    const prescription = await Prescription.create({
      ...data,
      doctorId: doctor._id,
    })

    return sendResponse({
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    })
  }
)

export const GET = withAuth(Role.DOCTOR, Role.ADMIN)(async (req: NextRequest, context, user) => {
  const doctor = await Doctor.findOne({ userId: user.id })
  
  const searchParams = req.nextUrl.searchParams
  const appointmentId = searchParams.get("appointmentId")
  const patientId = searchParams.get("patientId")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  const query: any = {}
  
  if (user.role === Role.DOCTOR && doctor) {
    query.doctorId = doctor._id
  }

  if (appointmentId) query.appointmentId = appointmentId
  if (patientId) query.patientId = patientId

  const total = await Prescription.countDocuments(query)
  const prescriptions = await Prescription.find(query)
    .populate("patientId", "name gender age phone")
    .populate("doctorId", "name specialization")
    .populate("appointmentId", "appointmentDate appointmentTime")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec()

  return sendResponse({
    statusCode: StatusCodes.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    data: prescriptions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  })
})
