import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value, bgcolor,color}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`backdrop-blur-md overflow-hidden rounded-xl border shadow-2xl p-2 bg-white`}
    >
      <div className={`px-4 py-6 sm:p-6`}>
        <span className={`inline-block p-2 rounded-[5px] items-center ${bgcolor} text-sm font-medium text-gray-800`}>
          <Icon size={18} className={`rounded ${color}`} />
        </span>
        <p className="mt-2 mb-2 text-2xl font-semibold text-black">{value}</p>
        <span className="text-gray-800 ">{name}</span>
      </div>
    </motion.div>
  );
};

export default StatCard;
