export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How does marketplace work?</h2>
          <p className="text-gray-600">
            Spaces can be sold in the secondary market after the initial native auction has been completed. 
            The owner of a space can create a Partially Signed Bitcoin Transaction (PSBT) that includes 
            the transfer of their space. This transaction becomes valid when it includes an output sending 
            the specified amount of bitcoins to the seller.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to sell a space</h2>
          <div className="space-y-4 text-gray-600">
            <div className="mb-4">
              <p className="font-medium mb-2">Prerequisites:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must own the space</li>
                <li>The space must be in your spaces-wallet</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">Steps to create a listing:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Load your wallet using spaces CLI</li>
                <li>Use the following command:</li>
              </ol>
              <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto font-mono text-sm">
                {'space-cli --chain mainnet sell @spacename <price>'}
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to buy a space</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              You can buy a space using the CLI, regardless of whether you found the listing on this website 
              or received it from another source.
            </p>
            <div className="mt-4">
              <p className="font-medium mb-2">Command syntax:</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto font-mono text-sm">
                space-cli --chain mainnet buy @spacename {'<price>'} --seller {'<seller_address>'} --signature {'<signature>'} [--fee-rate=rate]
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to remove a listing</h2>
          <p className="text-gray-600">
            Listings don't have an intrinsic expiration time and remain valid indefinitely unless the UTXO storing 
            the space changes. To invalidate a listing, simply make a renewal or a transfer to your own address.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Troubleshooting</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Why doesn't my listing appear on the marketplace?</h3>
              <p className="text-gray-600">
                This marketplace displays only the listing with the lowest price for a given name. 
                Therefore, you cannot create a listing with a higher price than the current lowest listing.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Is this secure?</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Yes. Each listing is verified by the spaces daemon, which checks the signatures from PSBTs. 
              It only allows transactions that are transfers with a seller-specified refund. Listings cannot 
              be altered and remain valid. This website serves as an aggregator of such listings.
            </p>
            
            <div className="mt-6">
              <p className="font-medium mb-2">More Information:</p>
              <div className="space-y-2">
                <a 
                  href="https://docs.spacesprotocol.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block text-blue-600 hover:underline"
                >
                  Spaces Protocol Documentation →
                </a>
                <a 
                  href="https://t.me/spacesprotocol" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block text-blue-600 hover:underline"
                >
                  Telegram Group →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
