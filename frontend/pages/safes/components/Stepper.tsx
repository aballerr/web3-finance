import { useMemo } from "react";
import { Check } from "react-feather";
import useUserSafes from "stores/useUserSafesSetup";

const CheckMark = () => {
  return (
    <div className="bg-primary-50 w-24px h-24px rounded-full flex items-center justify-center">
      <Check color="#00CF9D" size={16} strokeWidth={3} />
    </div>
  );
};

const ProgressCircle = () => {
  return (
    <div className="bg-green-50 w-24px h-24px rounded-full flex items-center justify-center">
      <div className="bg-green-600 w-8px h-8px rounded-full"></div>
    </div>
  );
};

const NotStartedCircle = () => {
  return (
    <div className="bg-gray-50 w-24px h-24px flex items-center justify-center rounded-full">
      <div className="bg-gray-200 w-8px h-8px rounded-full"></div>
    </div>
  );
};

const State = ({
  isInProgress,
  isComplete,
}: {
  isInProgress: boolean;
  isComplete: boolean;
}) => {
  if (isInProgress) {
    return <ProgressCircle />;
  } else if (isComplete) {
    return <CheckMark />;
  } else return <NotStartedCircle />;
};

const Line = ({ isComplete }: { isComplete: boolean }) => {
  const backgroundColor = isComplete ? "bg-primary-500" : "bg-gray-200";

  return <div className={`h-56px w-2px ${backgroundColor}`}></div>;
};

const Step = ({
  stepNumber,
  stepInfo,
}: {
  stepNumber: number;
  stepInfo: string;
}) => {
  return (
    <div className="flex flex-col mb-40px">
      <div className="text-gray-400">Step {stepNumber}</div>
      <div className="text-gray-700 font-bold">{stepInfo}</div>
    </div>
  );
};

const Stepper = () => {
  const stepProgress = useUserSafes((state) => state.step);
  const setStep = useUserSafes((state) => state.setStep);
  const isCreating = useUserSafes((state) => state.isCreating);
  const orginalImportComplete = useUserSafes(
    (state) => state.orginalImportComplete
  );

  const step = useMemo(() => {
    if (orginalImportComplete) return 4;
    else if (stepProgress <= 1) return 1;
    else if (stepProgress <= 3) return 2;
    return 3;
  }, [orginalImportComplete, stepProgress]);

  return (
    <div className="ml-48px mt-56px flex">
      <div className="mr-12px flex items-center content-center flex-col">
        <span onClick={() => setStep(0)}>
          <State isInProgress={step === 1} isComplete={step > 1} />
        </span>

        <div className="p-4px" />
        <Line isComplete={step > 1} />
        <span onClick={() => (step > 1 ? setStep(2) : null)}>
          <State isInProgress={step === 2} isComplete={step > 2} />
        </span>

        <Line isComplete={step > 2} />
        <div className="p-4px" />

        <State isInProgress={step === 3} isComplete={step > 3} />

        {orginalImportComplete && (
          <>
            <Line isComplete={step > 3} />
            <div className="p-4px" />
            <State isInProgress={step === 4} isComplete={step > 3} />
          </>
        )}
      </div>
      <div>
        <Step stepNumber={1} stepInfo="Connect Wallet" />
        <Step
          stepNumber={2}
          stepInfo={isCreating ? "Create a Safe" : "Import Safe"}
        />
        <Step
          stepNumber={3}
          stepInfo={
            orginalImportComplete
              ? "Imported Safes"
              : "Import another safe or finish"
          }
        />
        {orginalImportComplete && (
          <Step
            stepNumber={4}
            stepInfo={
              orginalImportComplete
                ? "Importing or creating another safe..."
                : "Finish"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Stepper;
