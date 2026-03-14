// src/components/ui/footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/products/savings" className="text-sm text-gray-600 hover:text-ewb-purple">Savings Accounts</Link></li>
              <li><Link href="/products/loans" className="text-sm text-gray-600 hover:text-ewb-purple">Personal Loans</Link></li>
              <li><Link href="/products/credit-cards" className="text-sm text-gray-600 hover:text-ewb-purple">Credit Cards</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-ewb-purple">About Us</Link></li>
              <li><Link href="/branches" className="text-sm text-gray-600 hover:text-ewb-purple">Branches &amp; ATMs</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-600 hover:text-ewb-purple">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-ewb-purple">Contact Us</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-600 hover:text-ewb-purple">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-ewb-purple">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-ewb-purple">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            EastWest Banking Corporation is regulated by the Bangko Sentral ng
            Pilipinas (BSP). Deposits are insured by the Philippine Deposit
            Insurance Corporation (PDIC) up to ₱500,000 per depositor.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} EastWest Banking Corporation. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
