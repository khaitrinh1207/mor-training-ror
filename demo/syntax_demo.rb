class Auth
  def self.enable_features *features
    puts "Enabled features:"

    features.each do |feature|
      puts "- #{feature}"
    end
  end
end


class User < Auth
  enable_features :login, :reset_password, :remember_me
end
