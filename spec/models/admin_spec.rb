require 'rails_helper'

RSpec.describe Admin, type: :model do
  describe 'factory' do
    it 'builds a valid admin' do
      expect(build(:admin)).to be_valid
    end
  end

  describe 'validations' do
    it 'requires an email' do
      admin = build(:admin, email: nil)

      expect(admin).not_to be_valid
      expect(admin.errors[:email]).to be_present
    end

    it 'requires a unique email' do
      create(:admin, email: 'admin@example.com')
      admin = build(:admin, email: 'admin@example.com')

      expect(admin).not_to be_valid
      expect(admin.errors[:email]).to include('has already been taken')
    end

    it 'requires a password with minimum length' do
      admin = build(:admin, password: 'short', password_confirmation: 'short')

      expect(admin).not_to be_valid
      expect(admin.errors[:password]).to be_present
    end
  end

  describe '.devise_modules' do
    it 'enables BitStar-like database authentication modules' do
      expect(described_class.devise_modules).to include(
        :database_authenticatable,
        :registerable,
        :recoverable,
        :rememberable,
        :validatable
      )
    end
  end
end
