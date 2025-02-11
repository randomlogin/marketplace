# How does marketplace work?

Spaces can be sold in secondary market (after the initial, native auction has been finished). The owner of a space can
create a Partially Signed Bitcoin Transaction with a transfer of his space. This transaction can be made into a real
valid one if it is supplied with an output sending some amount of bitcoins to the seller. 


# How to sell a space?

Prerequisites:
1) You should own a space
2) You should have a space in your `spaces-wallet`

To create a listing command line interface of `spaces` can be user. 
You have to load your wallet, next invoke the command with the following syntax.


# How to buy a name?

Similarly to selling of a space, it can be bought via cli. It doesn't matter whether you found a listing on this website
or received via other source.

# How to remove the listing?

Listings do not have intrinsic expiration time, so they are valid forever, unless the UTXO which stores the space
changes. It means it suffices to make a transfer/renewal to yourself in order to invalidate a listing.


# I posted a listing but it doesn't apper on the markteplace.

This marketplace shows the listing with the lowest price for a given name, therefore you cannot increase the price.

# Is this secure?

Yes. Each listing is verified by the spaces daemon, which checks the signatures from PSBTs. It doesn't allow any txs
except the transfers with a seller-specified refund. Listings cannot be altered and remain valid. This website is a mere
aggregator of such listings.


More information can be found at [https://docs.spacesprotocol.org/](spaces protocol website) and
[https://t.me/spacesprotocol](spaces telegram group).
