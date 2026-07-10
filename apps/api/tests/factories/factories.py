import factory
from faker import Faker

fake = Faker()


class UserFactory(factory.DictFactory):
    """Factory generating standard user records for testing."""

    id = factory.LazyFunction(fake.uuid4)
    email = factory.LazyAttribute(lambda o: fake.email())
    name = factory.LazyAttribute(lambda o: fake.name())
    is_active = True


class OrganizationFactory(factory.DictFactory):
    """Factory generating standard organization records for testing."""

    id = factory.LazyFunction(fake.uuid4)
    name = factory.LazyAttribute(lambda o: fake.company())
    slug = factory.LazyAttribute(lambda o: fake.slug())


class EventFactory(factory.DictFactory):
    """Factory generating standard event records for testing."""

    id = factory.LazyFunction(fake.uuid4)
    title = factory.LazyAttribute(lambda o: fake.sentence())
    description = factory.LazyAttribute(lambda o: fake.paragraph())
