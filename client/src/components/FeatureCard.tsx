type FeatureCardProps = {
  title: string;
  description: string;
};


function FeatureCard({
  title,
  description,
}: FeatureCardProps) {

  return (
    <div>

      <h3>
        {title}
      </h3>


      <p>
        {description}
      </p>

    </div>
  );
}


export default FeatureCard;