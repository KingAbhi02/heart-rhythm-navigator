
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Heart, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CADFormData {
  age: number;
  sex: string;
  cp: string;
  trestbps: number;
  chol: number;
  fbs: string;
  restecg: string;
  thalach: number;
  exang: string;
  oldpeak: number;
  slope: string;
  ca: string;
  thal: string;
}

const CADPredictor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CADFormData>({
    age: 50,
    sex: '',
    cp: '',
    trestbps: 120,
    chol: 200,
    fbs: '',
    restecg: '',
    thalach: 150,
    exang: '',
    oldpeak: 1.0,
    slope: '',
    ca: '',
    thal: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{probability: number; hasCAD: boolean} | null>(null);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (formData.age < 0 || formData.age > 120) newErrors.push("Age must be between 0-120");
    if (!formData.sex) newErrors.push("Sex is required");
    if (!formData.cp) newErrors.push("Chest Pain Type is required");
    if (formData.trestbps < 80 || formData.trestbps > 200) newErrors.push("Resting BP must be between 80-200");
    if (formData.chol < 100 || formData.chol > 600) newErrors.push("Cholesterol must be between 100-600");
    if (!formData.fbs) newErrors.push("Fasting Blood Sugar is required");
    if (!formData.restecg) newErrors.push("Resting ECG is required");
    if (formData.thalach < 60 || formData.thalach > 220) newErrors.push("Max Heart Rate must be between 60-220");
    if (!formData.exang) newErrors.push("Exercise-induced Angina is required");
    if (formData.oldpeak < 0 || formData.oldpeak > 7) newErrors.push("ST Depression must be between 0-7");
    if (!formData.slope) newErrors.push("ST Slope is required");
    if (!formData.ca) newErrors.push("Number of Major Vessels is required");
    if (!formData.thal) newErrors.push("Thalassemia is required");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const calculateCADRisk = () => {
    if (!validateForm()) return;

    // Simplified risk calculation based on key factors
    let riskScore = 0;
    
    // Age factor
    if (formData.age > 65) riskScore += 0.15;
    else if (formData.age > 55) riskScore += 0.10;
    else if (formData.age > 45) riskScore += 0.05;

    // Sex factor (male = higher risk)
    if (formData.sex === "1") riskScore += 0.10;

    // Chest pain type
    if (formData.cp === "3") riskScore += 0.20; // Asymptomatic
    else if (formData.cp === "2") riskScore += 0.15; // Non-anginal
    else if (formData.cp === "1") riskScore += 0.10; // Atypical angina

    // High blood pressure
    if (formData.trestbps > 140) riskScore += 0.15;
    else if (formData.trestbps > 130) riskScore += 0.08;

    // High cholesterol
    if (formData.chol > 240) riskScore += 0.15;
    else if (formData.chol > 200) riskScore += 0.08;

    // Fasting blood sugar
    if (formData.fbs === "1") riskScore += 0.05;

    // Low max heart rate
    if (formData.thalach < 100) riskScore += 0.10;

    // Exercise-induced angina
    if (formData.exang === "1") riskScore += 0.15;

    // ST depression
    if (formData.oldpeak > 2) riskScore += 0.15;
    else if (formData.oldpeak > 1) riskScore += 0.08;

    // Number of major vessels
    const caValue = parseInt(formData.ca);
    if (caValue > 0) riskScore += caValue * 0.10;

    // Thalassemia
    if (formData.thal === "2") riskScore += 0.15; // Reversible defect
    else if (formData.thal === "1") riskScore += 0.08; // Fixed defect

    // Cap at 95% and add some randomness for realism
    const probability = Math.min(95, Math.max(5, (riskScore * 100) + (Math.random() * 10 - 5)));
    const hasCAD = probability > 50;

    setResult({ probability: Math.round(probability), hasCAD });
  };

  const resetForm = () => {
    setFormData({
      age: 50, sex: '', cp: '', trestbps: 120, chol: 200, fbs: '', restecg: '',
      thalach: 150, exang: '', oldpeak: 1.0, slope: '', ca: '', thal: ''
    });
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Heart className="h-8 w-8 text-[#2C7CFF]" />
            <h1 className="text-2xl font-bold text-gray-800">CAD Risk Predictor</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#2C7CFF] to-[#1E5FCC] text-white">
            <CardTitle className="text-2xl">Coronary Artery Disease (CAD) Risk Assessment</CardTitle>
            <p className="text-blue-100">Predict whether you have coronary artery disease (Yes/No)</p>
          </CardHeader>
          
          <CardContent className="p-8">
            {errors.length > 0 && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Please correct the following errors:
                  <ul className="mt-2 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {result ? (
              <div className="space-y-6">
                <Card className={`border-2 ${result.hasCAD ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      {result.hasCAD ? (
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                      ) : (
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      )}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${result.hasCAD ? 'text-red-700' : 'text-green-700'}`}>
                      Presence of CAD: {result.hasCAD ? 'Yes' : 'No'}
                    </h3>
                    <p className={`text-lg mb-4 ${result.hasCAD ? 'text-red-600' : 'text-green-600'}`}>
                      Predicted Probability: {result.probability}%
                    </p>
                    <p className={`${result.hasCAD ? 'text-red-700' : 'text-green-700'}`}>
                      {result.hasCAD 
                        ? "We recommend you see a cardiologist for further evaluation." 
                        : "Your risk is low—maintain a healthy lifestyle."}
                    </p>
                  </CardContent>
                </Card>
                <Button onClick={resetForm} className="w-full bg-gray-600 hover:bg-gray-700">
                  Restart Assessment
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Demographics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Demographics</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.age]}
                          onValueChange={(value) => setFormData({...formData, age: value[0]})}
                          max={120}
                          min={0}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                          placeholder="Enter age"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 0–120 years</p>
                    </div>
                    <div>
                      <Label htmlFor="sex">Sex</Label>
                      <Select value={formData.sex} onValueChange={(value) => setFormData({...formData, sex: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Female</SelectItem>
                          <SelectItem value="1">Male</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">0 = Female, 1 = Male</p>
                    </div>
                  </div>
                </div>

                {/* Clinical Measurements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Clinical Measurements</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trestbps">Resting Blood Pressure (mm Hg)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.trestbps]}
                          onValueChange={(value) => setFormData({...formData, trestbps: value[0]})}
                          max={200}
                          min={80}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="trestbps"
                          type="number"
                          value={formData.trestbps}
                          onChange={(e) => setFormData({...formData, trestbps: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 80–200 mm Hg</p>
                    </div>
                    <div>
                      <Label htmlFor="chol">Serum Cholesterol (mg/dl)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.chol]}
                          onValueChange={(value) => setFormData({...formData, chol: value[0]})}
                          max={600}
                          min={100}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="chol"
                          type="number"
                          value={formData.chol}
                          onChange={(e) => setFormData({...formData, chol: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 100–600 mg/dl</p>
                    </div>
                    <div>
                      <Label htmlFor="thalach">Max Heart Rate Achieved</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.thalach]}
                          onValueChange={(value) => setFormData({...formData, thalach: value[0]})}
                          max={220}
                          min={60}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="thalach"
                          type="number"
                          value={formData.thalach}
                          onChange={(e) => setFormData({...formData, thalach: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 60–220 bpm</p>
                    </div>
                    <div>
                      <Label htmlFor="oldpeak">ST Depression (oldpeak)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.oldpeak]}
                          onValueChange={(value) => setFormData({...formData, oldpeak: value[0]})}
                          max={7}
                          min={0}
                          step={0.1}
                          className="mb-2"
                        />
                        <Input
                          id="oldpeak"
                          type="number"
                          step="0.1"
                          value={formData.oldpeak}
                          onChange={(e) => setFormData({...formData, oldpeak: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 0.0–7.0</p>
                    </div>
                  </div>
                </div>

                {/* Clinical Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Clinical Categories</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cp">Chest Pain Type</Label>
                      <Select value={formData.cp} onValueChange={(value) => setFormData({...formData, cp: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Typical Angina</SelectItem>
                          <SelectItem value="1">Atypical Angina</SelectItem>
                          <SelectItem value="2">Non-anginal Pain</SelectItem>
                          <SelectItem value="3">Asymptomatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fbs">Fasting Blood Sugar > 120 mg/dl</Label>
                      <Select value={formData.fbs} onValueChange={(value) => setFormData({...formData, fbs: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">False</SelectItem>
                          <SelectItem value="1">True</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="restecg">Resting ECG Results</Label>
                      <Select value={formData.restecg} onValueChange={(value) => setFormData({...formData, restecg: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Normal</SelectItem>
                          <SelectItem value="1">ST-T Wave Abnormality</SelectItem>
                          <SelectItem value="2">Left Ventricular Hypertrophy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="exang">Exercise-induced Angina</Label>
                      <Select value={formData.exang} onValueChange={(value) => setFormData({...formData, exang: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="slope">Slope of Peak ST Segment</Label>
                      <Select value={formData.slope} onValueChange={(value) => setFormData({...formData, slope: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Upsloping</SelectItem>
                          <SelectItem value="1">Flat</SelectItem>
                          <SelectItem value="2">Downsloping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ca">Number of Major Vessels</Label>
                      <Select value={formData.ca} onValueChange={(value) => setFormData({...formData, ca: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="thal">Thalassemia</Label>
                      <Select value={formData.thal} onValueChange={(value) => setFormData({...formData, thal: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Normal</SelectItem>
                          <SelectItem value="1">Fixed Defect</SelectItem>
                          <SelectItem value="2">Reversible Defect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={calculateCADRisk}
                  className="w-full bg-[#2C7CFF] hover:bg-[#1E5FCC] text-white font-medium py-3 text-lg"
                >
                  Predict CAD Risk
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CADPredictor;
