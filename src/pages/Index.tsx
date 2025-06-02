
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Activity } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-[#2C7CFF]" />
            <h1 className="text-2xl font-bold text-gray-800">Heart Health Predictor</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Banner */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Heart Health Predictor & Arrhythmia Classifier
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Advanced cardiovascular risk assessment tools to help you understand your heart health. 
            Choose from our specialized prediction models below.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* CAD Predictor Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2C7CFF] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-[#2C7CFF]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Coronary Artery Disease (CAD) Predictor
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Enter demographic and clinical lab values to assess your risk of coronary artery disease. 
                  Get immediate results with personalized recommendations.
                </p>
                <Button 
                  onClick={() => navigate('/cad-predictor')}
                  className="w-full bg-[#2C7CFF] hover:bg-[#1E5FCC] text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Start CAD Assessment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Arrhythmia Classifier Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2C7CFF] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="h-8 w-8 text-[#2C7CFF]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Arrhythmia Probability Classifier
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Enter ECG features to estimate your probability across 15 arrhythmia classes. 
                  Advanced analysis for comprehensive cardiac rhythm assessment.
                </p>
                <Button 
                  onClick={() => navigate('/arrhythmia-classifier')}
                  className="w-full bg-[#2C7CFF] hover:bg-[#1E5FCC] text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Start Arrhythmia Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-4xl mx-auto">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Medical Disclaimer:</strong> These tools are for educational and informational purposes only. 
            They are not intended to replace professional medical advice, diagnosis, or treatment. 
            Always consult with a qualified healthcare provider regarding any medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
