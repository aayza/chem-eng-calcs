from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

def unit_conversion(calculation):
    return ((calculation)*(1/60)*(1/60))

def heat_load(mH, CpH, TH_in, TH_out, mC, CpC, TC_in, TC_out):
    Q_H = unit_conversion(mH * CpH * (TH_in - TH_out))
    Q_C = unit_conversion(mC * CpC * (TC_out - TC_in))
    return Q_H, Q_C

def lmtd(TH_in, TH_out, TC_in, TC_out, flow_type="counter"): 
    if flow_type == "counter":
        delta_T1 = TH_in - TC_out
        delta_T2 = TH_out - TC_in
    else:  # co-current flow
        delta_T1 = TH_in - TC_in
        delta_T2 = TH_out - TC_out

    # Avoid division by zero when temperature differences are equal
    if delta_T1 == delta_T2:
        return delta_T1

    return (delta_T1 - delta_T2) / math.log(delta_T1 / delta_T2)

def film_coefficients(data):
    # Inner tube calculations
    De_inner_tube = data["IN_pip_di_in"]
    Af_inner_tube = (math.pi * (De_inner_tube ** 2)) / 4

    # Annular space calculations
    De_annular_space = data["OUT_pip_di_in"] - data["IN_pip_di_out"]
    Af_annular_space = (math.pi * ((data["OUT_pip_di_in"] ** 2) - (data["IN_pip_di_out"] ** 2))) / 4

    # Compute velocities (using the cold stream mass flow rate, mC)
    velocity_inner_tube = unit_conversion(data["mC"] / (data["pDense_inner"] * Af_inner_tube))
    velocity_annular_space = unit_conversion(data["mC"] / (data["pDense_annular"] * Af_annular_space)
)
    # Reynolds numbers
    Re_inner_tube = (data["pDense_inner"] * velocity_inner_tube * De_inner_tube) / data["mu_inner"]
    Re_annular_space = (data["pDense_annular"] * velocity_annular_space * De_annular_space) / data["mu_annular"]

    # Prandtl numbers
    Pr_inner_tube = (data["heat_cap_inner"] * data["mu_inner"]) / data["thermal_conductivity_inner"]
    Pr_annular_space = (data["heat_cap_annular"] * data["mu_annular"]) / data["thermal_conductivity_annular"]

    def calculate_nusselt_inner(Re, Pr, De, length):
        if Re > 2300:  # Turbulent flow
            f = 0.782 * math.log(Re) - (1.51**-2)
            return (f / 8) * (Re - 1000) * (Pr * (1 + De / length) ** (2/3)) / (
                1 + 12.7 * (f / 8) ** 0.5 * (Pr ** (2/3) - 1)
            ) * (data["mu_inner"] / data["mu_vis_wall"]) ** 0.14
        else:  # Laminar flow
            return (1.86 * (Re * Pr * De / length) ** (1/3)) * (data["mu_inner"] / data["mu_vis_wall"]) ** 0.14
        
    def calculate_nusselt_annular(Re, Pr, De, length):
        if Re > 2300:  # Turbulent flow
            f = 0.782 * math.log(Re) - (1.51**-2)
            return (f / 8) * (Re - 1000) * (Pr * (1 + De / length) ** (2/3)) / (
                1 + 12.7 * (f / 8) ** 0.5 * (Pr ** (2/3) - 1)
            ) * (data["mu_annular"] / data["mu_vis_wall"]) ** 0.14
        else:  # Laminar flow
            return (1.86 * (Re * Pr * De / length) ** (1/3)) * (data["mu_annular"] / data["mu_vis_wall"]) ** 0.14

    Nu_inner_tube = calculate_nusselt_inner(Re_inner_tube, Pr_inner_tube, De_inner_tube, data["length_DoublePipeEx"])
    Nu_annular_space = calculate_nusselt_annular(Re_annular_space, Pr_annular_space, De_annular_space, data["length_DoublePipeEx"])

    hi_inner_tube = (Nu_inner_tube * data["thermal_conductivity_inner"]) / De_inner_tube
    ho_annular_space = (Nu_annular_space * data["thermal_conductivity_annular"]) / De_annular_space

    return hi_inner_tube, ho_annular_space

def wall_temperature(hi, ho, mean_temp_in_pipe, mean_temp_annular_pipe):
    return (hi * mean_temp_in_pipe + ho * mean_temp_annular_pipe) / (hi + ho)

def overall_heat_transfer_coefficient(data, hi, ho):
    resistance = ((data["IN_pip_di_out"] / hi) * data["IN_pip_di_in"]) + \
                 (data["IN_pip_di_out"] * math.log(data["IN_pip_di_out"] / data["IN_pip_di_in"]) / (2 * data["thermal_conductivity_tube"])) + \
                 (1 / ho) + (data["fouling_factor_inner"] * (data["IN_pip_di_out"] / data["IN_pip_di_in"])) + \
                 data["fouling_factor_annular"]
    return 1 / resistance

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()

        # List of required keys
        required_keys = [
            "mH", "CpH", "TH_in", "TH_out", 
            "mC", "CpC", "TC_in", "TC_out", 
            "IN_pip_di_in", "IN_pip_di_out", "OUT_pip_di_in", 
            "pDense_inner", "pDense_annular", "mu_inner", "mu_annular", "heat_cap_inner", "heat_cap_annular", "thermal_conductivity_inner", "thermal_conductivity_annular", "mu_vis_wall", 
            "length_DoublePipeEx", "fouling_factor_inner", "fouling_factor_annular", 
            "thermal_conductivity_tube", "mean_temp_in_pipe_fluid", "mean_temp_annular_pipe_fluid"
        ]

        # 1. Check for missing keys
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            return jsonify({"error": f"Missing keys: {', '.join(missing_keys)}"}), 400

        # 2. Validate each input is a float and meets basic constraints
        #    We'll do a simple > 0 check for properties that must be positive,
        #    and allow any float for temperatures.
        positive_keys = {
            "mH", "CpH", "mC", "CpC", 
            "IN_pip_di_in", "IN_pip_di_out", "OUT_pip_di_in", 
            "pDense", "pDense_annular", "mu_inner", "mu_annular", "heat_cap_inner", "heat_cap_annular", "thermal_conductivity_inner", "thermal_conductivity_annular", "mu_vis_wall", 
            "length_DoublePipeEx", "fouling_factor_inner", "fouling_factor_annular", 
            "thermal_conductivity_tube"
        }

        # Convert all values to float, raise error if invalid
        for key in required_keys:
            try:
                data[key] = float(data[key])
            except ValueError:
                return jsonify({"error": f"Invalid numeric value for '{key}'"}), 400
            
            # If key must be positive, check
            if key in positive_keys and data[key] <= 0:
                return jsonify({"error": f"Value for '{key}' must be > 0"}), 400

        # 3. Perform the calculations
        Q_H, Q_C = heat_load(
            data["mH"], data["CpH"], data["TH_in"], data["TH_out"],
            data["mC"], data["CpC"], data["TC_in"], data["TC_out"]
        )

        LMTD_counter = lmtd(data["TH_in"], data["TH_out"], data["TC_in"], data["TC_out"], flow_type="counter")

        hi, ho = film_coefficients(data)
        wall_temp = wall_temperature(hi, ho, data["mean_temp_in_pipe_fluid"], data["mean_temp_annular_pipe_fluid"])
        U = overall_heat_transfer_coefficient(data, hi, ho)

        # 4. Prepare JSON-safe results (avoid complex types)
        results = {
            "Q_H": float(Q_H),
            "Q_C": float(Q_C),
            "LMTD_counter": float(LMTD_counter),
            "LMTD_co": float(0),
            "hi_inner_tube": float(hi),
            "ho_annular_space": float(ho),
            "wall_temperature": float(wall_temp),
            "overall_heat_transfer_coefficient": float(U)
        }

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
