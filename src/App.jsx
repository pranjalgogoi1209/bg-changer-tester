import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import axios from "axios";

export default function App() {
  const initialForm = {
    image_base64: null,
    background_b64: null,
    prompt: "The attire is a Bengali attire",
    idol_safe_zone_top: 0.3,
    min_group_scale: 0.4,
    max_group_scale: 0.7,
    user_scale: 0.5,
    horizontal_shift: 0,
    color_balance: 0.3,
  };

  const [form, setForm] = useState(initialForm);
  const [outputImage, setOutputImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event, key) => {
    if (event.target.files && event.target.files[0]) {
      setForm((prev) => ({
        ...prev,
        [key]: event.target.files[0],
      }));
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number" || type === "range" || type === "select-one"
          ? Number(value)
          : value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image_base64 || !form.background_b64) {
      alert("Please upload both images");
      return;
    }
    setIsLoading(true);

    // Helper to convert File object to base64 (returns a Promise)
    function toBase64(file) {
      return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
      });
    }

    // Convert both images to base64 strings
    const [selfie_b64, bg_b64] = await Promise.all([
      toBase64(form.image_base64),
      toBase64(form.background_b64),
    ]);

    // Now use these base64 strings as needed
    const submitData = {
      ...form,
      image_base64: selfie_b64.split(",")[1],
      background_b64: bg_b64.split(",")[1],
      output_format: "png",
      prompt_upsampling: false,
      safety_tolerance: 2,
      feather_px: 3,
    };

    console.log(submitData);

    // API call
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/edit`,
        submitData
      );
      console.log("API response:", response.data);
      setOutputImage(response.data.composited_image);
      setIsLoading(false);
    } catch (error) {
      console.error("API error:", error);
      alert("Submission failed");
      setIsLoading(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    setForm(initialForm);
    setOutputImage(null);
    document.getElementById("selfie-upload").value = "";
    document.getElementById("background-upload").value = "";
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      {outputImage ? (
        <div className="p-4 rounded shadow-lg bg-black bg-opacity-75 text-light rounded-3">
          <h2 className="mb-4 text-center fw-bold">Output Image</h2>
          <img
            src={`data:image/png;base64,${outputImage}`}
            alt="Output"
            className="rounded img-fluid"
            style={{ maxHeight: "500px", width: "auto" }}
          />
          <button
            className="btn btn-primary btn-lg mt-4 d-block mx-auto w-50"
            onClick={() => setOutputImage(null)}
          >
            Try Again
          </button>
        </div>
      ) : (
        <form
          className="p-4 rounded shadow-lg bg-black bg-opacity-75 text-light rounded-3"
          style={{ maxWidth: "700px", width: "100%" }}
          onSubmit={handleSubmit}
        >
          <h2 className="mb-4 text-center fw-bold">Bg Changer Tester App</h2>
          <div className="row g-3">
            {/* Selfie uploader */}
            <div className="col-12 col-md-6">
              <label htmlFor="selfie-upload" className="form-label">
                User Selfie
              </label>
              <input
                id="selfie-upload"
                type="file"
                accept="image/*"
                className="form-control bg-dark text-light"
                onChange={(e) => handleFileChange(e, "image_base64")}
              />
              {form.image_base64 && (
                <div className="mt-2 text-center">
                  <img
                    src={URL.createObjectURL(form.image_base64)}
                    alt="User Selfie"
                    className="rounded img-fluid"
                    style={{ maxHeight: "120px", width: "auto" }}
                  />
                </div>
              )}
            </div>
            {/* Background uploader */}
            <div className="col-12 col-md-6">
              <label htmlFor="background-upload" className="form-label">
                Background Image
              </label>
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                className="form-control bg-dark text-light"
                onChange={(e) => handleFileChange(e, "background_b64")}
              />
              {form.background_b64 && (
                <div className="mt-2 text-center">
                  <img
                    src={URL.createObjectURL(form.background_b64)}
                    alt="Background"
                    className="rounded img-fluid"
                    style={{ maxHeight: "120px", width: "auto" }}
                  />
                </div>
              )}
            </div>
            {/* Parameters */}
            <div className="col-12 col-md-6">
              <label className="form-label">Attire Prompt</label>
              <input
                type="text"
                name="prompt"
                className="form-control bg-dark text-light"
                value={form.prompt}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Idol Safe Zone Top (0.3-0.7)</label>
              <input
                type="number"
                name="idol_safe_zone_top"
                /* min={0.3}
                max={0.7} */
                step={0.01}
                className="form-control bg-dark text-light"
                value={form.idol_safe_zone_top}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Min Group Scale (0.4-1.0)</label>
              <input
                type="number"
                name="min_group_scale"
                /* min={0.4}
                max={1} */
                step={0.01}
                className="form-control bg-dark text-light"
                value={form.min_group_scale}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Max Group Scale (0.7-1.0)</label>
              <input
                type="number"
                name="max_group_scale"
                /*  min={0.7}
                max={1} */
                step={0.01}
                className="form-control bg-dark text-light"
                value={form.max_group_scale}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">User Scale (0.5-1.0)</label>
              <input
                type="number"
                name="user_scale"
                /*   min={0.5}
                max={1} */
                step={0.01}
                className="form-control bg-dark text-light"
                value={form.user_scale}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Horizontal Shift (-1, 0, 1)</label>
              <select
                name="horizontal_shift"
                className="form-select bg-dark text-light"
                value={form.horizontal_shift}
                onChange={handleInputChange}
              >
                <option value={-1}>-1</option>
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Color Balance (0.3-1.0)</label>
              <input
                type="number"
                name="color_balance"
                /*  min={0.3}
                max={1} */
                step={0.01}
                className="form-control bg-dark text-light"
                value={form.color_balance}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-6 mt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-lg btn-primary w-100"
              >
                {isLoading ? (
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
            <div className="col-6 mt-3">
              <button
                type="button"
                className="btn btn-lg btn-secondary w-100"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
