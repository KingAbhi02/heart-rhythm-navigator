
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ArrhythmiaFormData {
  age: number;
  sex: string;
  height: number;
  weight: number;
  heartRate: number;
  qrsDur: number;
  prInt: number;
  qtInt: number;
  tInt: number;
  qWave: number;
  rWave: number;
  sWave: number;
  rPrimeWave: number;
  sPrimeWave: number;
  ampRWave: number;
  jjWave: number;
  intDef: string;
  qrsa: string;
  qrsta: number;
  diiMean: number;
  diiiMean: number;
  avrMean: number;
  avlMean: number;
  avfMean: number;
  v1Mean: number;
  diiMax: number;
  diiiMax: number;
  avrMax: number;
  avlMax: number;
  avfMax: number;
  v1Max: number;
}

interface ArrhythmiaResult {
  probabilities: { class: string; probability: number }[];
  mostLikely: { class: string; probability: number };
  message: string;
  icon: 'normal' | 'warning' | 'info';
}

const ARRHYTHMIA_CLASSES = [
  "Normal",
  "Left Bundle Branch Block",
  "Right Bundle Branch Block", 
  "Premature Ventricular Contraction",
  "Supraventricular Arrhythmia",
  "Atrial Fibrillation",
  "Atrial Flutter",
  "Ventricular Premature Contraction (PVC)",
  "Ventricular Tachycardia",
  "Ventricular Fibrillation",
  "Junctional Arrhythmia",
  "Sinus Tachycardia",
  "Sinus Bradycardia",
  "Sinus Arrhythmia",
  "Atrial Premature Contraction"
];

const ArrhythmiaClassifier = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ArrhythmiaFormData>({
    age: 45, sex: '', height: 170, weight: 70, heartRate: 75,
    qrsDur: 100, prInt: 160, qtInt: 400, tInt: 160,
    qWave: 0, rWave: 1, sWave: 0, rPrimeWave: 0, sPrimeWave: 0,
    ampRWave: 10, jjWave: 5, intDef: '', qrsa: '', qrsta: 20,
    diiMean: 0, diiiMean: 0, avrMean: 0, avlMean: 0, avfMean: 0, v1Mean: 0,
    diiMax: 1, diiiMax: 1, avrMax: 1, avlMax: 1, avfMax: 1, v1Max: 1
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ArrhythmiaResult | null>(null);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (formData.age < 0 || formData.age > 120) newErrors.push("Age must be between 0-120");
    if (!formData.sex) newErrors.push("Sex is required");
    if (formData.height < 120 || formData.height > 220) newErrors.push("Height must be between 120-220 cm");
    if (formData.weight < 30 || formData.weight > 150) newErrors.push("Weight must be between 30-150 kg");
    if (formData.heartRate < 40 || formData.heartRate > 200) newErrors.push("Heart Rate must be between 40-200 bpm");
    if (formData.qrsDur < 40 || formData.qrsDur > 300) newErrors.push("QRS Duration must be between 40-300 ms");
    if (formData.prInt < 100 || formData.prInt > 300) newErrors.push("P-R Interval must be between 100-300 ms");
    if (formData.qtInt < 200 || formData.qtInt > 500) newErrors.push("Q-T Interval must be between 200-500 ms");
    if (!formData.intDef) newErrors.push("Int Def is required");
    if (!formData.qrsa) newErrors.push("QRSA is required");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const calculateArrhythmiaRisk = () => {
    if (!validateForm()) return;

    // Calculate deviation score based on abnormal values
    let deviationScore = 0;
    
    // Heart rate deviations
    if (formData.heartRate < 60 || formData.heartRate > 100) deviationScore += 0.1;
    if (formData.heartRate < 50 || formData.heartRate > 120) deviationScore += 0.1;
    
    // QRS duration (normal: 80-120ms)
    if (formData.qrsDur < 80 || formData.qrsDur > 120) deviationScore += 0.15;
    if (formData.qrsDur > 140) deviationScore += 0.2; // Significant prolongation
    
    // P-R interval (normal: 120-200ms)
    if (formData.prInt < 120 || formData.prInt > 200) deviationScore += 0.1;
    
    // Q-T interval (normal: 350-450ms)
    if (formData.qtInt < 350 || formData.qtInt > 450) deviationScore += 0.1;
    if (formData.qtInt > 480) deviationScore += 0.15; // Long QT
    
    // Wave morphology abnormalities
    if (Math.abs(formData.qWave) > 0.5) deviationScore += 0.1;
    if (formData.rWave < 0.5 || formData.rWave > 5) deviationScore += 0.1;
    if (Math.abs(formData.sWave) > 3) deviationScore += 0.1;
    
    // Age factor
    if (formData.age > 65) deviationScore += 0.05;
    
    // Specific indicators
    if (formData.intDef === "1") deviationScore += 0.15;
    if (formData.qrsa === "1") deviationScore += 0.1;

    // Cap deviation score
    deviationScore = Math.min(deviationScore, 0.8);

    // Create base probability distribution
    const normalProb = Math.max(0.01, 0.85 - deviationScore);
    const abnormalProb = 1 - normalProb;

    // Distribute abnormal probability across other classes
    const probabilities = ARRHYTHMIA_CLASSES.map((className, index) => {
      if (index === 0) {
        return { class: className, probability: normalProb };
      } else {
        // Add some logic to favor certain conditions based on specific parameters
        let classProbability = abnormalProb / (ARRHYTHMIA_CLASSES.length - 1);
        
        // Adjust probabilities based on specific findings
        if (className.includes("Bundle Branch Block") && formData.qrsDur > 120) {
          classProbability *= 2;
        }
        if (className.includes("Tachycardia") && formData.heartRate > 100) {
          classProbability *= 2;
        }
        if (className.includes("Bradycardia") && formData.heartRate < 60) {
          classProbability *= 2;
        }
        if (className.includes("Atrial") && formData.prInt > 200) {
          classProbability *= 1.5;
        }
        if (className.includes("Ventricular") && Math.abs(formData.sWave) > 2) {
          classProbability *= 1.5;
        }
        
        return { class: className, probability: classProbability };
      }
    });

    // Normalize probabilities
    const totalProb = probabilities.reduce((sum, p) => sum + p.probability, 0);
    const normalizedProbs = probabilities.map(p => ({
      ...p,
      probability: (p.probability / totalProb) * 100
    }));

    // Sort by probability
    normalizedProbs.sort((a, b) => b.probability - a.probability);

    const mostLikely = normalizedProbs[0];
    
    let message = "";
    let icon: 'normal' | 'warning' | 'info' = 'info';
    
    if (mostLikely.class === "Normal" && mostLikely.probability > 50) {
      message = "✅ Your ECG data appears normal.";
      icon = 'normal';
    } else if (mostLikely.probability > 30 && mostLikely.class !== "Normal") {
      message = `⚠️ Your ECG data suggests possible ${mostLikely.class}. Please consult a cardiologist.`;
      icon = 'warning';
    } else {
      message = "ℹ️ Mixed signals—consider further testing.";
      icon = 'info';
    }

    setResult({
      probabilities: normalizedProbs,
      mostLikely,
      message,
      icon
    });
  };

  const resetForm = () => {
    setFormData({
      age: 45, sex: '', height: 170, weight: 70, heartRate: 75,
      qrsDur: 100, prInt: 160, qtInt: 400, tInt: 160,
      qWave: 0, rWave: 1, sWave: 0, rPrimeWave: 0, sPrimeWave: 0,
      ampRWave: 10, jjWave: 5, intDef: '', qrsa: '', qrsta: 20,
      diiMean: 0, diiiMean: 0, avrMean: 0, avlMean: 0, avfMean: 0, v1Mean: 0,
      diiMax: 1, diiiMax: 1, avrMax: 1, avlMax: 1, avfMax: 1, v1Max: 1
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
            <Activity className="h-8 w-8 text-[#2C7CFF]" />
            <h1 className="text-2xl font-bold text-gray-800">Arrhythmia Classifier</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#2C7CFF] to-[#1E5FCC] text-white">
            <CardTitle className="text-2xl">Arrhythmia Probability Classifier</CardTitle>
            <p className="text-blue-100">Enter your ECG features to estimate probability across 15 classes</p>
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
                {/* Most Likely Result Banner */}
                <Card className={`border-2 ${
                  result.icon === 'normal' ? 'border-green-300 bg-green-50' :
                  result.icon === 'warning' ? 'border-red-300 bg-red-50' :
                  'border-blue-300 bg-blue-50'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      {result.icon === 'normal' && <CheckCircle className="h-12 w-12 text-green-600" />}
                      {result.icon === 'warning' && <AlertTriangle className="h-12 w-12 text-red-600" />}
                      {result.icon === 'info' && <Info className="h-12 w-12 text-blue-600" />}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      result.icon === 'normal' ? 'text-green-700' :
                      result.icon === 'warning' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      Most Likely: {result.mostLikely.class}
                    </h3>
                    <p className={`text-lg mb-4 ${
                      result.icon === 'normal' ? 'text-green-600' :
                      result.icon === 'warning' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      Probability: {result.mostLikely.probability.toFixed(1)}%
                    </p>
                    <p className={`${
                      result.icon === 'normal' ? 'text-green-700' :
                      result.icon === 'warning' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {result.message}
                    </p>
                  </CardContent>
                </Card>

                {/* Probability Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Probability Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.probabilities.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.class}</span>
                            <span>{item.probability.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={item.probability} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={resetForm} className="w-full bg-gray-600 hover:bg-gray-700">
                  Clear & Re-enter
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Demographics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Demographics</h3>
                  <div className="grid md:grid-cols-3 gap-4">
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
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.height]}
                          onValueChange={(value) => setFormData({...formData, height: value[0]})}
                          max={220}
                          min={120}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 120–220 cm</p>
                    </div>
                  </div>
                </div>

                {/* Basic Measurements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Measurements</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.weight]}
                          onValueChange={(value) => setFormData({...formData, weight: value[0]})}
                          max={150}
                          min={30}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 30–150 kg</p>
                    </div>
                    <div>
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.heartRate]}
                          onValueChange={(value) => setFormData({...formData, heartRate: value[0]})}
                          max={200}
                          min={40}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="heartRate"
                          type="number"
                          value={formData.heartRate}
                          onChange={(e) => setFormData({...formData, heartRate: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 40–200 bpm</p>
                    </div>
                  </div>
                </div>

                {/* ECG Intervals */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">ECG Intervals</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="qrsDur">QRS Duration (ms)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.qrsDur]}
                          onValueChange={(value) => setFormData({...formData, qrsDur: value[0]})}
                          max={300}
                          min={40}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="qrsDur"
                          type="number"
                          value={formData.qrsDur}
                          onChange={(e) => setFormData({...formData, qrsDur: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 40–300 ms</p>
                    </div>
                    <div>
                      <Label htmlFor="prInt">P-R Interval (ms)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.prInt]}
                          onValueChange={(value) => setFormData({...formData, prInt: value[0]})}
                          max={300}
                          min={100}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="prInt"
                          type="number"
                          value={formData.prInt}
                          onChange={(e) => setFormData({...formData, prInt: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 100–300 ms</p>
                    </div>
                    <div>
                      <Label htmlFor="qtInt">Q-T Interval (ms)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.qtInt]}
                          onValueChange={(value) => setFormData({...formData, qtInt: value[0]})}
                          max={500}
                          min={200}
                          step={1}
                          className="mb-2"
                        />
                        <Input
                          id="qtInt"
                          type="number"
                          value={formData.qtInt}
                          onChange={(e) => setFormData({...formData, qtInt: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: 200–500 ms</p>
                    </div>
                  </div>
                </div>

                {/* Wave Morphology */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Wave Morphology</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="qWave">Q Wave (mV)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.qWave]}
                          onValueChange={(value) => setFormData({...formData, qWave: value[0]})}
                          max={1}
                          min={-1}
                          step={0.1}
                          className="mb-2"
                        />
                        <Input
                          id="qWave"
                          type="number"
                          step="0.1"
                          value={formData.qWave}
                          onChange={(e) => setFormData({...formData, qWave: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: -1 to 1 mV</p>
                    </div>
                    <div>
                      <Label htmlFor="rWave">R Wave (mV)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.rWave]}
                          onValueChange={(value) => setFormData({...formData, rWave: value[0]})}
                          max={10}
                          min={-10}
                          step={0.1}
                          className="mb-2"
                        />
                        <Input
                          id="rWave"
                          type="number"
                          step="0.1"
                          value={formData.rWave}
                          onChange={(e) => setFormData({...formData, rWave: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: -10 to 10 mV</p>
                    </div>
                    <div>
                      <Label htmlFor="sWave">S Wave (mV)</Label>
                      <div className="mt-2">
                        <Slider
                          value={[formData.sWave]}
                          onValueChange={(value) => setFormData({...formData, sWave: value[0]})}
                          max={10}
                          min={-10}
                          step={0.1}
                          className="mb-2"
                        />
                        <Input
                          id="sWave"
                          type="number"
                          step="0.1"
                          value={formData.sWave}
                          onChange={(e) => setFormData({...formData, sWave: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Range: -10 to 10 mV</p>
                    </div>
                  </div>
                </div>

                {/* Binary Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Additional Parameters</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="intDef">Int Def</Label>
                      <Select value={formData.intDef} onValueChange={(value) => setFormData({...formData, intDef: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">0 or 1</p>
                    </div>
                    <div>
                      <Label htmlFor="qrsa">QRSA</Label>
                      <Select value={formData.qrsa} onValueChange={(value) => setFormData({...formData, qrsa: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">0 or 1</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={calculateArrhythmiaRisk}
                  className="w-full bg-[#2C7CFF] hover:bg-[#1E5FCC] text-white font-medium py-3 text-lg"
                >
                  Predict Arrhythmia Probabilities
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArrhythmiaClassifier;
