import { Wallet, Coins } from "lucide-react";

const PaymentSelection = ({ paymentMethod, onChangePayment }) => {
  const methods = {
    cash: { label: "Cash on delivery", icon: Coins },
    wallet: { label: "AccessRide Wallet", icon: Wallet },
  };

  const active = methods[paymentMethod] || methods.cash;
  const ActiveIcon = active.icon;

  const cyclePayment = () => {
    // Cycles between payment methods for demo purposes
    const keys = Object.keys(methods);
    const nextIndex = (keys.indexOf(paymentMethod) + 1) % keys.length;
    onChangePayment(keys[nextIndex]);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg text-[#0B2F89]">
          <ActiveIcon size={20} />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Payment Method</p>
          <p className="text-xs font-bold text-[#0B2F89] mt-0.5">{active.label}</p>
        </div>
      </div>

      <button
        onClick={cyclePayment}
        className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer"
      >
        Change
      </button>
    </div>
  );
};

export default PaymentSelection;
