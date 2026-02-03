import { PrismaClient, Webinar as PrismaWebinar } from '@prisma/client';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

export class PrismaWebinarRepository implements IWebinarRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(webinar: Webinar): Promise<void> {
    await this.prisma.webinar.create({
      data: WebinarMapper.toPersistence(webinar),
    });
    return;
  }
  async findById(id: string): Promise<Webinar | null> {
    const maybeWebinar = await this.prisma.webinar.findUnique({
      where: { id },
    });
    if (!maybeWebinar) {
      return null;
    }
    // Ensure the result is mapped to a Webinar entity
    return new Webinar({
      id: maybeWebinar.id,
      organizerId: maybeWebinar.organizerId,
      title: maybeWebinar.title,
      startDate: maybeWebinar.startDate,
      endDate: maybeWebinar.endDate,
      seats: maybeWebinar.seats,
    });
  }
  async update(webinar: Webinar): Promise<void> {
    await this.prisma.webinar.update({
      where: { id: webinar.props.id },
      data: WebinarMapper.toPersistence(webinar),
    });
    return;
  }
}

class WebinarMapper {
  static toEntity(webinar: PrismaWebinar): Webinar {
    return new Webinar({
      id: webinar.id,
      organizerId: webinar.organizerId,
      title: webinar.title,
      startDate: webinar.startDate,
      endDate: webinar.endDate,
      seats: webinar.seats,
    });
  }

  static toPersistence(webinar: Webinar): PrismaWebinar {
    return {
      id: webinar.props.id,
      organizerId: webinar.props.organizerId,
      title: webinar.props.title,
      startDate: webinar.props.startDate,
      endDate: webinar.props.endDate,
      seats: webinar.props.seats,
    };
  }
}