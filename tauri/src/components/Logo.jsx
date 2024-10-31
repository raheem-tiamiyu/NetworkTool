import { motion } from "framer-motion";
import OVVLOGO from "../assets/Ovintivlogo.png";
import { Box, Typography } from "@mui/material";

const Logo = () => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box display={"flex"} flexDirection={"row"} justifyContent={"center"}>
        <img src={OVVLOGO} alt="ovintiv logo" height={"80px"} />
      </Box>
      <Typography variant="subtitle2" textAlign={"center"} marginBottom={8}>
        Search and delete files on your network
      </Typography>
    </motion.div>
  );
};

export default Logo;
