import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
} from "@mui/material";

// Define TypeScript interfaces for inputs and results
interface InputValues {
  mH: string;
  CpH: string;
  TH_in: string;
  TH_out: string;
  mC: string;
  CpC: string;
  TC_in: string;
  TC_out: string;
  IN_pip_di_in: string;
  IN_pip_di_out: string;
  OUT_pip_di_in: string;
  pDense_inner: string;
  pDense_annular: string;
  mu_inner: string;
  mu_annular: string;
  heat_cap_inner: string;
  heat_cap_annular: string;
  thermal_conductivity_inner: string;
  thermal_conductivity_annular: string;
  mu_vis_wall: string;
  length_DoublePipeEx: string;
  fouling_factor_inner: string;
  fouling_factor_annular: string;
  thermal_conductivity_tube: string;
  mean_temp_in_pipe_fluid: string;
  mean_temp_annular_pipe_fluid: string;
}

interface CalculationResults {
  Q_H: number;
  Q_C: number;
  LMTD_counter: number;
  LMTD_co: number;
  hi_inner_tube: number;
  ho_annular_space: number;
  wall_temperature: number;
  overall_heat_transfer_coefficient: number;
}

const HeatExchangerCalculator: React.FC = () => {
  // State for inputs
  const [inputs, setInputs] = useState<InputValues>({
    mH: "",
    CpH: "",
    TH_in: "",
    TH_out: "",
    mC: "",
    CpC: "",
    TC_in: "",
    TC_out: "",
    IN_pip_di_in: "",
    IN_pip_di_out: "",
    OUT_pip_di_in: "",
    pDense_inner: "",
    pDense_annular: "",
    mu_inner: "",
    mu_annular: "",
    heat_cap_inner: "",
    heat_cap_annular: "",
    thermal_conductivity_inner: "",
    thermal_conductivity_annular: "",
    mu_vis_wall: "",
    length_DoublePipeEx: "",
    fouling_factor_inner: "",
    fouling_factor_annular: "",
    thermal_conductivity_tube: "",
    mean_temp_in_pipe_fluid: "",
    mean_temp_annular_pipe_fluid: "",
  });

  // State for results
  const [results, setResults] = useState<CalculationResults | null>(null);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log("Submitting form...");
    console.log("Inputs:", inputs);
    e.preventDefault();
    try {
      const numericInputs = Object.fromEntries(
        Object.entries(inputs).map(([key, value]) => [key, parseFloat(value)])
      );
      const response = await axios.post<CalculationResults>(
        "http://127.0.0.1:5000/calculate",
        numericInputs
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Heat Exchanger Calculator (Double Pipe Heat Exchanger) {`:)`}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Hot Stream Inputs */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mass flow rate of hot stream (mH, kg/h)"
              name="mH"
              type="number"
              value={inputs.mH}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Specific heat capacity of hot stream (CpH, J/kg.K)"
              name="CpH"
              type="number"
              value={inputs.CpH}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Inlet temperature of hot stream (TH_in, °C)"
              name="TH_in"
              type="number"
              value={inputs.TH_in}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Outlet temperature of hot stream (TH_out, °C)"
              name="TH_out"
              type="number"
              value={inputs.TH_out}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Cold Stream Inputs */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mass flow rate of cold stream (mC, kg/h)"
              name="mC"
              type="number"
              value={inputs.mC}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Specific heat capacity of cold stream (CpC, J/kg.K)"
              name="CpC"
              type="number"
              value={inputs.CpC}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Inlet temperature of cold stream (TC_in, °C)"
              name="TC_in"
              type="number"
              value={inputs.TC_in}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Outlet temperature of cold stream (TC_out, °C)"
              name="TC_out"
              type="number"
              value={inputs.TC_out}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Pipe Dimensions */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Inner diameter of inner pipe (IN_pip_di_in, m)"
              name="IN_pip_di_in"
              type="number"
              value={inputs.IN_pip_di_in}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Outer diameter of inner pipe (IN_pip_di_out, m)"
              name="IN_pip_di_out"
              type="number"
              value={inputs.IN_pip_di_out}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Inner diameter of outer pipe (OUT_pip_di_in, m)"
              name="OUT_pip_di_in"
              type="number"
              value={inputs.OUT_pip_di_in}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Fluid Properties */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fluid density Inner Tube (pDense_inner, kg/m³)"
              name="pDense_inner"
              type="number"
              value={inputs.pDense_inner}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fluid density Annular (pDense_annular, kg/m³)"
              name="pDense_annular"
              type="number"
              value={inputs.pDense_annular}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Dynamic viscosity inner (mu_inner, Pa.s)"
              name="mu_inner"
              type="number"
              value={inputs.mu_inner}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Dynamic viscosity annular (mu_annular, Pa.s)"
              name="mu_annular"
              type="number"
              value={inputs.mu_annular}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Specific heat capacity of inner fluid (heat_cap_inner, J/kg.K)"
              name="heat_cap_inner"
              type="number"
              value={inputs.heat_cap_inner}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Specific heat capacity of annular fluid (heat_cap_annular, J/kg.K)"
              name="heat_cap_annular"
              type="number"
              value={inputs.heat_cap_annular}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Thermal conductivity Inner (thermal_conductivity, W/m.K)"
              name="thermal_conductivity_inner"
              type="number"
              value={inputs.thermal_conductivity_inner}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Thermal conductivity Annular (thermal_conductivity, W/m.K)"
              name="thermal_conductivity_annular"
              type="number"
              value={inputs.thermal_conductivity_annular}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Dynamic viscosity at wall temperature (mu_vis_wall, Pa.s)"
              name="mu_vis_wall"
              type="number"
              value={inputs.mu_vis_wall}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Heat Exchanger Properties */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Length of double pipe heat exchanger (length_DoublePipeEx, m)"
              name="length_DoublePipeEx"
              type="number"
              value={inputs.length_DoublePipeEx}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fouling factor for inner tube (fouling_factor_inner)"
              name="fouling_factor_inner"
              type="number"
              value={inputs.fouling_factor_inner}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fouling factor for annular space (fouling_factor_annular)"
              name="fouling_factor_annular"
              type="number"
              value={inputs.fouling_factor_annular}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Thermal conductivity of tube material (thermal_conductivity_tube, W/m.K)"
              name="thermal_conductivity_tube"
              type="number"
              value={inputs.thermal_conductivity_tube}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Mean Temperatures */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mean temperature of inner pipe fluid (mean_temp_in_pipe_fluid, °C)"
              name="mean_temp_in_pipe_fluid"
              type="number"
              value={inputs.mean_temp_in_pipe_fluid}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mean temperature of annular pipe fluid (mean_temp_annular_pipe_fluid, °C)"
              name="mean_temp_annular_pipe_fluid"
              type="number"
              value={inputs.mean_temp_annular_pipe_fluid}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Calculate
          </Button>
        </Box>
      </Box>

      {results && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Results:
          </Typography>
          <Typography variant="body1">
            Heat Load (Hot Stream): {results.Q_H.toFixed(10)} W
          </Typography>
          <Typography variant="body1">
            Heat Load (Cold Stream): {results.Q_C.toFixed(10)} W
          </Typography>
          <Typography variant="body1">
            LMTD (Counterflow): {results.LMTD_counter.toFixed(10)} °C
          </Typography>
          <Typography variant="body1">
            LMTD (Cocurrent): {results.LMTD_co.toFixed(10)} °C
          </Typography>
          <Typography variant="body1">
            Inner Tube Film Coefficient: {results.hi_inner_tube.toFixed(10)}{" "}
            W/m².K
          </Typography>
          <Typography variant="body1">
            Annular Space Film Coefficient:{" "}
            {results.ho_annular_space.toFixed(10)} W/m².K
          </Typography>
          <Typography variant="body1">
            Wall Temperature: {results.wall_temperature.toFixed(10)} °C
          </Typography>
          <Typography variant="body1">
            Overall Heat Transfer Coefficient:{" "}
            {results.overall_heat_transfer_coefficient.toFixed(10)} W/m².K
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default HeatExchangerCalculator;
