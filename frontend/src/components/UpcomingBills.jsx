import { formatMoney } from '../utils/currency';

export default function UpcomingBills({ bills, currency = 'USD' }) {
  const hasBills = bills.length > 0;

  return (
    <div className={`${hasBills ? 'bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-900' : 'bg-white shadow-sm dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800'} rounded-2xl p-4 sm:p-6`}>
      <p className={`${hasBills ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-100'} font-semibold text-sm mb-2`}>
        Upcoming Bills - due within 48 hours
      </p>
      {!hasBills && (
        <p className="text-gray-400 text-sm dark:text-gray-500">No upcoming bills due soon.</p>
      )}
      <div className="space-y-1.5">
        {bills.map(bill => (
          <div key={bill.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium dark:text-gray-100">{bill.name}</span>
            <span className="text-orange-700 font-semibold dark:text-orange-300">
              {formatMoney(bill.display_price ?? bill.price, bill.display_currency ?? currency)}{' '}
              <span className="text-orange-500 font-normal dark:text-orange-400">
                &middot; {new Date(bill.billing_date).toLocaleDateString()}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
