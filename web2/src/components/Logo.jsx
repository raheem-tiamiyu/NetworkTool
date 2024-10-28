import { motion } from "framer-motion";
import OVVLOGO from "../assets/Ovintivlogo.png";

const Logo = () => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-row justify-center">
        <img src={OVVLOGO} alt="ovintiv logo" className="h-[80px]" />
      </div>
      <p className="text-center text-sm">
        Search and delete files on your network
      </p>
    </motion.div>
  );
};

export default Logo;
