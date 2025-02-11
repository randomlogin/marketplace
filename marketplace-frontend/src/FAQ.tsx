export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">How to Use the Marketplace</h1>
      
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
            <p>Prerequisites:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must own the space</li>
              <li>The space must be in your spaces-wallet</li>
            </ul>
            <p>To create a listing:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Load your wallet using space-cli</li>
              <li>Use the sell command with the following syntax:</li>
            </ol>
            <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto">
              <code>$ space-cli --chain mainnet sell @spacename "price"</code>
            </pre>
            <p>Example output:</p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`{
  "space": "@broccoli",
  "price": 1,
  "seller": "bcrts1puwxrrml9z8fv8j2wk7fssw3zl2702gjh099eff9vwxjva8d6wurqgf3dmx",
  "signature": "cd4aa595a7e2fcf4e79958f1ab314cbcb2bc2b27950e9ee9e53522e1a47470cfe35abb362983e0b0b8c6513e23ce43fcb13f4df8a80867368ec92664108fa769"
}`}
            </pre>
            <p>Then you can paste the output of the command here. </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to buy a space</h2>
          <div className="space-y-4 text-gray-600">
            <p>You can buy a space using the CLI, regardless of whether you found the listing on this website or received it from another source.</p>
            <p>Use the following command syntax:</p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <code>$ space-cli --chain mainnet buy @spacename price --seller seller_address --signature signature_hash [--fee-rate=rate]</code>
            </pre>
            <p>Example:</p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>$ space-cli --chain mainnet buy @garlic 12000 --seller bcrts1pp9ayajlzm25zep7km8cqpu22cz4yhtfa5kf2xe4nat536lff4jes6zceuh --signature 90f391b4f5c7d6f6f7b942e8fa9421484971ea4ec52c8c5c2f02bf60eb67facc3426f1a4cd5052550e09af5f1b93923fd71289f47f30deb95ded7110d310119c --fee-rate=6000</code>
            </pre>
            <p className="text-sm italic mt-2">Note: The --fee-rate parameter is optional</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to remove a listing</h2>
          <p className="text-gray-600">
            Listings don't have an intrinsic expiration time and remain valid indefinitely unless the UTXO storing the space changes. 
            To invalidate a listing, simply make a transfer or renewal to your own address.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Troubleshooting</h2>
          <div className="space-y-4 text-gray-600">
            <h3 className="font-medium">My listing doesn't appear on the marketplace</h3>
            <p>
              This marketplace displays only the listing with the lowest price for a given name. 
              Therefore, you cannot create a listing with a higher price than the current lowest listing.
            </p>
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
            <div className="mt-4">
              <p>For more information, visit:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><a href="https://docs.spacesprotocol.org/" className="text-blue-600 hover:underline">Spaces protocol documentation</a></li>
                <li><a href="https://t.me/spacesprotocol" className="text-blue-600 hover:underline">Spaces telegram group</a></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
