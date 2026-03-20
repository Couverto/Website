import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  skeletonClassName?: string;
}

export const ImageWithSkeleton = ({
  wrapperClassName = "",
  skeletonClassName = "",
  className = "",
  ...props
}: ImageWithSkeletonProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {isLoading && <Skeleton className={`absolute inset-0 z-10 ${skeletonClassName}`} />}
      <img
        {...props}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={(e) => {
          setIsLoading(false);
          if (props.onLoad) props.onLoad(e);
        }}
        onError={(e) => {
          setIsLoading(false);
          if (props.onError) props.onError(e);
        }}
      />
    </div>
  );
};
