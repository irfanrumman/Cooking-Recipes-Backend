import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser, IVerifyEmailPayload } from "./auth.interface";
import { RegisterUser } from "./auth.validation";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { redisClient } from "../../lib/redis";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import { ActiveStatus } from "../../../generated/prisma/enums";


const registerUser = async (payload: RegisterUser) => {
  const { name, email, password, role } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExist) {
    throw new AppError("User already exists", httpStatus.CONFLICT);
  };


  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const expirationSeconds = 5 * 60;

  const otpKey = `user-registration-otp:${email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});
	

    const userRegistrationKey = `user-registration-data:${email}`;

    const redisUserDataPayload = {
		name,
		email,
		password: hashedPassword,
		role,
	};

     await redisClient.set(userRegistrationKey, JSON.stringify(redisUserDataPayload), {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

    const tempatePath = path.join(
		process.cwd(),
		"src/app/templates/registration-user-otp.ejs",
	);

	const templateData = {
		name,
		email,
		otp: otpValue,
		expirationMinutes: expirationSeconds / 60,
	};

    const html = await ejs.renderFile(tempatePath, templateData);

    await transporter.sendMail({
		from: {
				name: "Cooking Recipes",
				address: config.email_sender,
				},
		to: email,
		subject: "Email Verification",
		html,
	});
    


//   const createdUser = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     },
//     omit: {
//       password: true,
//     },
//   });

   

//   return createdUser;
};


const verifyUserEmail = async (payload: IVerifyEmailPayload) => {

    const otp = payload.otp;
    const email = payload.email.trim().toLowerCase();

    const isUserExist = await prisma.user.findUnique({
        where : {email},
    });

    if(!isUserExist){
        throw new AppError("User does not exist", httpStatus.NOT_FOUND);
    };

    if(isUserExist.activeStatus === ActiveStatus.ACTIVE){
        throw new AppError("User is already verified", httpStatus.BAD_REQUEST);
    };

    if(isUserExist.activeStatus === ActiveStatus.BLOCKED){
        throw new AppError("User is blocked", httpStatus.BAD_REQUEST);
    };

 

    const otpKey = `user-registration-otp:${email}`;
    const redisOtp = await redisClient.get(otpKey);

    if (!redisOtp) {
        throw new AppError("OTP has expired or is invalid", httpStatus.BAD_REQUEST);
    }

    if (redisOtp !== otp) {
        throw new AppError("Invalid OTP", httpStatus.BAD_REQUEST);
    }

    await redisClient.del(otpKey);

    const userRegistrationKey = `user-registration-data:${email}`;
    const redisUserData = await redisClient.get(userRegistrationKey);

    if (!redisUserData) {
        throw new AppError("User does not exist", httpStatus.BAD_REQUEST);
    };

    const userPayload = JSON.parse(redisUserData);

      const createdUser = await prisma.user.create({
    data: {
      name: userPayload.name,
      email: userPayload.email,
      password: userPayload.password,
      role: userPayload.role,
    },
    omit: {
      password: true,
    },
  });

  await redisClient.del(userRegistrationKey);

  const tempatePath = path.join(
        process.cwd(),
        "src/app/templates/user-welcome-email.ejs",
    );

    const templateData = {
        name: createdUser.name,
    };

    const html = await ejs.renderFile(tempatePath, templateData);

    await transporter.sendMail({
        from: {
                name: "Cooking Recipes",
                address: config.email_sender,
        },
        to: email,
        subject: "Welcome to Cooking Recipes",
        html,
    });

  return createdUser;

};


const loginUser = async (payload : ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({
        where : {email}
    })

    if (user.activeStatus === ActiveStatus.BLOCKED) {
        throw new Error("Your account has been blocked. Please contact support.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if(!isPasswordMatched){
        throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };
}

const refreshToken = async (refreshToken : string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

    if(!verifiedRefreshToken.success){
        throw new Error(verifiedRefreshToken.error)
    }

    const {id} = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id
        }
    })

    if(user.activeStatus === "BLOCKED"){
        throw new Error("User is blocked!")
    }

    const jwtPayload = {
        id,
        name : user.name,
        email : user.email,
        role : user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    return {accessToken}
}


export const authService = {
    registerUser,
    verifyUserEmail,
    loginUser,
    refreshToken
}