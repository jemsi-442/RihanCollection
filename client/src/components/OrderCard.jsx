export default function OrderCard({ order }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">
          Order #{order._id.slice(-6)}
        </span>
        <span className="text-sm text-primary">
          {order.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        {order.address}
      </p>

      <div className="text-sm">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.name} × {item.qty}
          </p>
        ))}
      </div>

      <p className="mt-3 font-bold text-primary">
        Jumla: TZS {order.totalAmount}
      </p>
    </div>
  );
}
