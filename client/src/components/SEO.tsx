import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  name?: string;
  type?: string;
  url?: string;
  image?: string;
  jsonLd?: Record<string, any>;
}

export const SEO = ({
  title = "Couverto - Gestion de restaurant simplifiée",
  description = "Boostez votre restaurant avec Couverto. La solution de gestion tout-en-un pour simplifier vos réservations, fidéliser vos clients et optimiser votre service.",
  keywords,
  name = "Couverto",
  type = "website",
  url,
  image = "/logos/logo.svg",
  ...props
}: SEOProps) => {
  const siteUrl = "https://couverto.fr";
  const fullUrl = url ? (url.startsWith("http") ? url : `${siteUrl}${url}`) : siteUrl;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {props.jsonLd && <script type="application/ld+json">{JSON.stringify(props.jsonLd)}</script>}
    </Helmet>
  );
};
