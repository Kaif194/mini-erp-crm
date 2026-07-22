import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ) {
    const responsePayload: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(responsePayload);
  }

  static error(
    res: Response,
    message = 'Error occurred',
    statusCode = 500,
    errors: any[] = []
  ) {
    const responsePayload: ApiResponse = {
      success: false,
      message,
      error: errors.length > 0 ? errors : undefined,
    };
    return res.status(statusCode).json(responsePayload);
  }
}
