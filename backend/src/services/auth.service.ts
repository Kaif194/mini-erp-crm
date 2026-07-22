import { UserRepository } from '../repositories/user.repository';
import { LoginInput } from '../validators/auth.validator';
import { comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(input.password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(authUser);

    return {
      token,
      user: authUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user;
  }
}
