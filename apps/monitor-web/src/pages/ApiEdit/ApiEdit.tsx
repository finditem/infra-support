import {
  ApiDefaultInformation,
  ApiEditHeader,
  ApiEditTitle,
  ApiOperationInformation,
} from "./_components";

const ApiEdit = () => {
  return (
    <div className="mx-auto min-w-[1154px]">
      <div className="flex flex-col gap-6">
        <ApiEditHeader />
        <ApiEditTitle />
        <ApiDefaultInformation />
        <ApiOperationInformation />
      </div>
    </div>
  );
};

export default ApiEdit;
