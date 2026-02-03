// Tests unitaires

import { testUser } from "src/users/tests/user-seeds";
import { ChangeSeats } from "./change-seats";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { Webinar } from "../entities/webinar.entity";
import { User } from "src/users/entities/user.entity";



describe('Feature : Change seats', () => {
  // Initialisation de nos tests, boilerplates...
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;
  const webinar = new Webinar({
        id: 'webinar-id',
        organizerId: testUser.alice.props.id,
        title: 'Webinar title',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-01T01:00:00Z'),
        seats: 100,
    });

    beforeEach(() => {
        webinarRepository = new InMemoryWebinarRepository([webinar]);
        useCase = new ChangeSeats(webinarRepository);
    });

  describe('Scenario: Happy path', () => {
    // Code commun à notre scénario : payload...
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 200,
    };
    it('should change the number of seats for a webinar', async () => {
     // Vérification de la règle métier, condition testée...
      // ACT
      await whenUserChangeSeatsWith(useCase, payload);
      // ASSERT
      await thenUpdatedWebinarSeatsShouldBe(webinarRepository);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'non-existent-webinar-id',
      seats: 200,
    };
    it('should fail', async () => {
      expectWebinarToRemainUnchanged(webinarRepository);

      return expect(useCase.execute(payload)).rejects.toThrow('Webinar not found');
    });
  });

  describe('Scenario: update the webinar of someone else', () => {
    const payload = { 
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 100,
    };
    it('should fail', async () => {
      expectWebinarToRemainUnchanged(webinarRepository);

      return expect(useCase.execute(payload)).rejects.toThrow('User is not allowed to update this webinar');
    });
  });

  describe('Scenario: change seat to an inferior number', () => {
    const payload = { 
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 99,
    };
    it('should fail to change the number of seats for a webinar', async () => {
      expectWebinarToRemainUnchanged(webinarRepository);
      return expect(useCase.execute(payload)).rejects.toThrow('You cannot reduce the number of seats');
    });
  });

  describe('Scenario: change seat to a number > 1000', () => {
    const payload = { 
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 1001,
    };
    it('should fail to change the number of seats for a webinar', async () => {
      expectWebinarToRemainUnchanged(webinarRepository);
      return expect(useCase.execute(payload)).rejects.toThrow('Webinar must have at most 1000 seats');
    });
  });
});

async function whenUserChangeSeatsWith(useCase: ChangeSeats, payload: { user: User; webinarId: string; seats: number; }) {
  await useCase.execute(payload);
}

async function thenUpdatedWebinarSeatsShouldBe(webinarRepository: InMemoryWebinarRepository) {
  const updatedWebinar = await webinarRepository.findById('webinar-id');
  expect(updatedWebinar?.props.seats).toEqual(200);
}


function expectWebinarToRemainUnchanged(webinarRepository: InMemoryWebinarRepository) {
  const webinar = webinarRepository.findByIdSync('webinar-id');
  expect(webinar?.props.seats).toEqual(100);
}
