interface ApiInfoTooltipProps {
  text: string;
}

const ApiInfoTooltip = ({ text }: ApiInfoTooltipProps) => {
  return (
    <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 flex-col items-center group-hover:flex">
      <div className="typo-body2-regular whitespace-nowrap rounded-[10px] bg-fill-neutural-normal-focused px-4 py-2 text-white">
        {text}
      </div>
      <div className="size-0 border-x-8 border-t-8 border-x-transparent border-t-fill-neutural-normal-focused" />
    </div>
  );
};

export default ApiInfoTooltip;
