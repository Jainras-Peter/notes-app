import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export const DemoInstructions = () => {
  return (
    <Card className="max-w-md mx-auto mt-8 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info className="w-5 h-5" />
          Note!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-800">
        <p className="mb-3">
          Use Valid Email to get OTP:
        </p>
        <div className="bg-white rounded p-3 border border-blue-200">
          <p><strong>Email:</strong> abc@gmail.com</p>
        </div>
        <p className="mt-3 text-xs text-blue-600">
          When all are valid OTP is sent to your Mail.
        </p>
      </CardContent>
    </Card>
  );
};
