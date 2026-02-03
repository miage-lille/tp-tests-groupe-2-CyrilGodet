import supertest from "supertest";
import { TestServerFixture } from "./tests/fixtures";

describe('Webinar Routes E2E', () => {
  let fixture: TestServerFixture;

  beforeAll(async () => {
    fixture = new TestServerFixture();
    await fixture.init();
  });

  beforeEach(async () => {
    await fixture.reset();
  });

  afterAll(async () => {
    await fixture.stop();
  });

  it('should update webinar seats', async () => {
    // ARRANGE
    const prisma = fixture.getPrismaClient();
    const server = fixture.getServer();

    const webinar = await prisma.webinar.create({
      data: {
        id: 'test-webinar',
        title: 'Webinar Test',
        seats: 10,
        startDate: new Date(),
        endDate: new Date(),
        organizerId: 'test-user',
      },
    });

    // ACT
    const response = await supertest(server)
      .post(`/webinars/${webinar.id}/seats`)
      .send({ seats: '30' })
      .expect(200);

    // ASSERT
    expect(response.body).toEqual({ message: 'Seats updated' });

    const updatedWebinar = await prisma.webinar.findUnique({
      where: { id: webinar.id },
    });
    expect(updatedWebinar?.seats).toBe(30);
  });

    it('should throw WebinarNotFoundException for non-existing webinar', async () => {
        const prisma = fixture.getPrismaClient();
        const server = fixture.getServer();

        const webinar = await prisma.webinar.create({
        data: {
            id: 'test-webinar',
            title: 'Webinar Test',
            seats: 10,
            startDate: new Date(),
            endDate: new Date(),
            organizerId: 'test-user',
        },
        });

        // ACT
        const response = await supertest(server)
        .post(`/webinars/otherwebinar/seats`)
        .send({ seats: '30' })
        .expect(404);

        // ASSERT
        expect(response.body).toEqual({ error: 'Webinar not found' });

        const updatedWebinar = await prisma.webinar.findUnique({
        where: { id: webinar.id },
        });
        expect(updatedWebinar?.seats).toBe(10);
    });

    it('should throw WebinarNotOrganizerException for a non-organizer', async () => {
        const prisma = fixture.getPrismaClient();
        const server = fixture.getServer();

        const webinar = await prisma.webinar.create({
            data: {
                id: 'test-webinar',
                title: 'Webinar Test',
                seats: 10,
                startDate: new Date(),
                endDate: new Date(),
                organizerId: 'other-user', 
            },
        });

        const response = await supertest(server)
            .post(`/webinars/${webinar.id}/seats`)
            .send({ seats: '30' })
            .expect(401); 

        expect(response.body).toEqual({ error: 'User is not allowed to update this webinar' });

        const updatedWebinar = await prisma.webinar.findUnique({
            where: { id: webinar.id },
        });
        expect(updatedWebinar?.seats).toBe(10); 
    });
});