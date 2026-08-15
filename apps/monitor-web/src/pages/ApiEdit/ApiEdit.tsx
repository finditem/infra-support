import {
  ApiDefaultInformation,
  ApiEditActionBar,
  ApiEditHeader,
  ApiEditTitle,
  ApiOperationInformation,
} from "./_components";

const ApiEdit = () => {
  return (
    <div className="-mx-6">
      <div className="mx-auto flex max-w-[960px] flex-col gap-5 px-6">
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
