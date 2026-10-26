import { NextRequest, NextResponse } from "next/server"
import { withAuthAndValidation } from "@/middleware/withAuthAndValidation"
import { withAuth } from "@/middleware/withAuth"
import { Role } from "@/app/api/user/user.interface"
import Prescription from "../prescription.model"
import Doctor from "@/app/api/doctor/doctor.model"
import {
  updatePrescriptionValidationSchema,
  UpdatePrescriptionInput,
} from "../prescription.validation"
import { StatusCodes } from "http-status-codes"
import { sendResponse } from "@/lib/utils/sendResponse"

export const GET = withAuth(
  Role.DOCTOR,
  Role.ADMIN,
  Role.PATIENT
)(async (req: NextRequest, context, user) => {
  const { prescriptionId } = await context.params

  const prescription = await Prescription.findById(prescriptionId)
    .populate("patientId", "name gender age phone email address")
    .populate(
      "doctorId",
      "name specialization hospital phone email qualifications"
    )
    .populate("appointmentId", "appointmentDate appointmentTime status")

  if (!prescription) {
    return NextResponse.json(
      { success: false, message: "Prescription not found" },
      { status: StatusCodes.NOT_FOUND }
    )
  }

  return sendResponse({
    statusCode: StatusCodes.OK,
    success: true,
    message: "Prescription retrieved successfully",
    data: prescription,
  })
})

export const PATCH = withAuthAndValidation(
  updatePrescriptionValidationSchema,
  [Role.DOCTOR],
  async (req, context, user, data: UpdatePrescriptionInput) => {

    const { prescriptionId } = await context.params
    const doctor = await Doctor.findOne({ userId: user.id })

    const prescription = await Prescription.findById(prescriptionId)
    if (!prescription) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (prescription.doctorId.toString() !== doctor?._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized to update this prescription",
        },
        { status: StatusCodes.FORBIDDEN }
      )
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      data,
      { new: true }
    )

    return sendResponse({
      statusCode: StatusCodes.OK,
      success: true,
      message: "Prescription updated successfully",
      data: updatedPrescription,
    })
  }
)

export const DELETE = withAuth(Role.DOCTOR)(async (
  req: NextRequest,
  context,
  user
) => {
  const { prescriptionId } = await context.params
  const doctor = await Doctor.findOne({ userId: user.id })

  const prescription = await Prescription.findById(prescriptionId)
  if (!prescription) {
    return NextResponse.json(
      { success: false, message: "Prescription not found" },
      { status: StatusCodes.NOT_FOUND }
    )
  }

  if (prescription.doctorId.toString() !== doctor?._id.toString()) {
    return NextResponse.json(
      { success: false, message: "Not authorized to delete this prescription" },
      { status: StatusCodes.FORBIDDEN }
    )
  }

  await Prescription.findByIdAndDelete(prescriptionId)

  return sendResponse({
    statusCode: StatusCodes.OK,
    success: true,
    message: "Prescription deleted successfully",
    data: null,
  })
})
