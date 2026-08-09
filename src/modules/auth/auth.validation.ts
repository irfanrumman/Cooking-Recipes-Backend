import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.preprocess(
  (value) => (typeof value === 'string' ? value.toUpperCase() : value),
    z.enum(['USER', 'AUTHOR'], { message: 'Role must be either USER or AUTHOR' })
  )
});

export const loginUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});



export const updateUserProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});




export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;