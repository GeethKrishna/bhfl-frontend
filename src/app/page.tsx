"use client";
import { useState } from "react";
import Select from "react-select";
import { ActionMeta, OnChangeValue } from "react-select";

interface ApiResponse {
  alphabets?: string[];
  numbers?: number[];
  highest_lowercase_alphabet?: string[];
  file_valid?: boolean;
  file_mime_type?: string;
  file_size_kb?: string;
  file_name?: string;
}

interface Option {
  value: string;
  label: string;
}

function App() {
  const [jsonInput, setJsonInput] = useState<string>('{"data": ["A","C","z"]}');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      const parsedInput = JSON.parse(jsonInput);
      if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
        throw new Error("Invalid input format");
      }
      setError("");

      const formData = new FormData();
      formData.append("data", JSON.stringify(parsedInput));
      if (file) {
        formData.append("file", file);
      }

      const apiResponse = await fetch("http://localhost:3001/bfhl", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`HTTP error! status: ${apiResponse.status}, message: ${errorText}`);
      }

      const data = await apiResponse.json() as ApiResponse;
      console.log("API Response:", data);
      setResponse(data);
    } 
    catch (error: unknown) {
      if (error instanceof Error) {
        setError("Error: " + error.message);
        console.error(error);
      } else {
        setError("An unknown error occurred");
        console.error("Unknown error:", error);
      }
    }
  };

  const handleDropdownChange = (selectedOptions: OnChangeValue<Option, true>, actionMeta: ActionMeta<Option>) => {
    if (selectedOptions) {
      setSelectedOptions(selectedOptions.map((option) => option.value));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    console.log("Rendering response:", response);

    let filteredResponse: string[] = [];

    if (typeof response === "object" && response !== null) {
      if (selectedOptions.includes("Alphabets") && response.alphabets) {
        filteredResponse.push("Alphabets: " + response.alphabets.join(", "));
      }
      if (selectedOptions.includes("Numbers") && response.numbers) {
        filteredResponse.push("Numbers: " + response.numbers.join(", "));
      }
      if (selectedOptions.includes("Highest lowercase alphabet") && response.highest_lowercase_alphabet) {
        filteredResponse.push("Highest lowercase alphabet: " + response.highest_lowercase_alphabet.join(", "));
      }
      if (selectedOptions.includes("File info")) {
        if (response.file_valid) {
          filteredResponse.push("File uploaded successfully");
          filteredResponse.push(`File MIME type: ${response.file_mime_type}`);
          filteredResponse.push(`File size: ${response.file_size_kb} KB`);
          filteredResponse.push(`File name: ${response.file_name}`);
        } else {
          filteredResponse.push("No file uploaded or invalid file");
        }
      }
    }

    return (
      <ul className="list-disc list-inside">
        {filteredResponse.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const options: Option[] = [
    { value: "Alphabets", label: "Alphabets" },
    { value: "Numbers", label: "Numbers" },
    { value: "Highest lowercase alphabet", label: "Highest lowercase alphabet" },
    { value: "File info", label: "File info" },
  ];

  return (
    <div className="text-center max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">JSON Input Form</h1>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='Enter JSON here (e.g., {"data": ["A","C","z"]})'
        className="w-full min-h-[100px] mb-2 p-2 border border-gray-300 rounded text-black"
      />
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
      >
        Submit
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}

      {response && (
        <>
          <Select
            isMulti
            options={options}
            onChange={handleDropdownChange}
            className="mt-4 text-black"
          />
          <div className="mt-4">{renderResponse()}</div>
        </>
      )}
    </div>
  );
}

export default App;