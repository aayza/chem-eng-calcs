import React from "react";
import HeatExchangerCalculator from "./HeatExchangeCalculator";
import { Typography } from "@mui/material";

const App: React.FC = () => {
  const heart = "<3";

  return (
    <div>
      <Typography variant="h4" gutterBottom align="center">
        Chemical Engineering Calculations {heart}
      </Typography>
      <HeatExchangerCalculator />
    </div>
  );
};

export default App;
