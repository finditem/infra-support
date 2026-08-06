import {
  ApiDefaultInformation,
  ApiEditActionBar,
  ApiEditHeader,
  ApiEditTitle,
  ApiOperationInformation,
} from "./_components";

const ApiEdit = () => {
  return (
    <div className="-mx-8">
      <div className="mx-auto flex max-w-[1154px] flex-col gap-6 px-8">
        <ApiEditHeader />
        <ApiEditTitle />
        <ApiDefaultInformation />
        <ApiOperationInformation />
      </div>
      <ApiEditActionBar />
    </div>
  );
};

export default ApiEdit;
