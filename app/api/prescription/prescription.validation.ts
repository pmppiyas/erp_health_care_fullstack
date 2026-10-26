import { z } from "zod"

export const medicineValidationSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  route: z.string().min(1, "Route is required"),
  instructions: z.string().min(1, "Instructions are required"),
})

export const createPrescriptionValidationSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  appointmentId: z.string().min(1, "Appointment ID is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  medicines: z.array(medicineValidationSchema).min(1, "At least one medicine is required"),
  notes: z.string().optional(),
  followUpDate: z.coerce.date().optional(),
})

export const updatePrescriptionValidationSchema = createPrescriptionValidationSchema.partial()

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionValidationSchema>
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionValidationSchema>


