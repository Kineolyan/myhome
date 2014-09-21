module Comptes

	class Transfer < Transaction
		def self.type_name
			"Virement"
		end
	end

end