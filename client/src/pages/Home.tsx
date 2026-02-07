import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const [selectedGeneration, setSelectedGeneration] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    tableNumber: string;
    seatPosition: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get members for selected generation
  const { data: members = [] } = trpc.members.getByGeneration.useQuery(
    selectedGeneration ? parseInt(selectedGeneration) : 0,
    { enabled: !!selectedGeneration }
  );

  // Register attendance mutation
  const registerMutation = trpc.attendance.register.useMutation({
    onSuccess: (data) => {
      setRegistrationResult(data);
      setError(null);
      setSelectedName("");
    },
    onError: (err) => {
      setError(err.message);
      setRegistrationResult(null);
    },
  });

  const handleRegister = async () => {
    if (!selectedGeneration || !selectedName) {
      setError("期と名前を選択してください");
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        name: selectedName,
        generation: parseInt(selectedGeneration),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generations = ["27", "28", "29", "30", "31", "32", "33", "34", "35", "36"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#FAFAF8] to-[#F5F5F0]">
      {/* Bauhaus geometric decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Red circle - top right */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600 rounded-full opacity-10 blur-3xl" />
        {/* Blue square - bottom left */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600 opacity-10 blur-3xl" />
        {/* Yellow accent - top left */}
        <div className="absolute top-1/4 -left-16 w-48 h-48 bg-yellow-400 opacity-5 blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-2 h-16 bg-red-600 rounded-full" />
            <h1 className="bauhaus-heading text-gray-900">
              OBOG会<br />出席確認
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
            期と名前を選択して、出席を登録してください。座席番号が表示されます。
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left column - Form */}
          <div className="space-y-8">
            <Card className="border-2 border-gray-900 shadow-lg">
              <CardHeader className="bg-gray-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl">出席登録フォーム</CardTitle>
                <CardDescription className="text-gray-200">
                  ステップに従って登録してください
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Step 1: Generation selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
                    ステップ 1: 期を選択
                  </label>
                  <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
                    <SelectTrigger className="border-2 border-gray-900 h-12 text-base">
                      <SelectValue placeholder="期を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {generations.map((gen) => (
                        <SelectItem key={gen} value={gen}>
                          {gen}期
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Name selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
                    ステップ 2: 名前を選択
                  </label>
                  <Select value={selectedName} onValueChange={setSelectedName} disabled={!selectedGeneration}>
                    <SelectTrigger className="border-2 border-gray-900 h-12 text-base disabled:opacity-50">
                      <SelectValue placeholder={selectedGeneration ? "名前を選択してください" : "先に期を選択してください"} />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex gap-3 p-4 bg-red-50 border-2 border-red-600 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Step 3: Register button */}
                <div className="pt-4">
                  <Button
                    onClick={handleRegister}
                    disabled={!selectedGeneration || !selectedName || isLoading}
                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg border-2 border-blue-600 hover:border-blue-700 transition-all duration-300 ease-out"
                  >
                    {isLoading ? "登録中..." : "出席を登録"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Result */}
          <div className="space-y-8">
            {registrationResult ? (
              <Card className="border-2 border-green-600 shadow-lg bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="bg-green-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8" />
                    <CardTitle className="text-2xl">出席が確認されました</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    {/* Seat information */}
                    <div className="bg-white p-6 border-2 border-green-600 rounded-lg">
                      <p className="text-sm font-bold text-gray-600 uppercase mb-2">あなたの座席</p>
                      <div className="flex items-baseline gap-4">
                        <div className="text-5xl font-black text-green-600">
                          {registrationResult.tableNumber === "自由" ? "自由" : `卓${registrationResult.tableNumber}`}
                        </div>
                        {registrationResult.tableNumber !== "自由" && (
                          <div className="text-3xl font-bold text-gray-900">
                            座席 {registrationResult.seatPosition}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex gap-3 justify-center">
                      <div className="w-4 h-4 bg-red-600 rounded-full" />
                      <div className="w-4 h-4 bg-blue-600 rounded-full" />
                      <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                    </div>

                    <p className="text-center text-gray-600">
                      ご出席ありがとうございます。<br />
                      指定された座席にお座りください。
                    </p>
                  </div>

                  {/* New registration button */}
                  <Button
                    onClick={() => {
                      setRegistrationResult(null);
                      setSelectedGeneration("");
                      setSelectedName("");
                    }}
                    className="w-full h-12 font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-lg border-2 border-gray-900 transition-all duration-300 ease-out"
                  >
                    別の方を登録
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-gray-300 bg-white">
                <CardContent className="p-8">
                  <div className="space-y-6 text-center">
                    {/* Bauhaus geometric decoration */}
                    <div className="flex justify-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-red-600 rounded-full opacity-20" />
                      <div className="w-16 h-16 bg-blue-600 opacity-20" />
                      <div className="w-16 h-16 bg-yellow-400 opacity-20" />
                    </div>
                    <p className="text-gray-600 text-lg">
                      左側のフォームで期と名前を選択して、<br />
                      出席を登録してください。
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Latest attendees */}
            <LatestAttendees />
          </div>
        </div>
      </div>
    </div>
  );
}

function LatestAttendees() {
  const { data: latestAttendance = [] } = trpc.attendance.getLatest.useQuery(5);

  if (latestAttendance.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-gray-300">
      <CardHeader>
        <CardTitle className="text-lg">最近の出席者</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {latestAttendance.map((record, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{record.name}</p>
                <p className="text-sm text-gray-600">{record.generation}期</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">卓{record.tableNumber}</p>
                <p className="text-sm text-gray-600">座席{record.seatPosition}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
