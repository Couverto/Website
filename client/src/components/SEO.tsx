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
  image = "/og-image.png",
  ...props
}: SEOProps) => {
  // couverto.fr redirects to www: canonical and share URLs must point to the final address
  const siteUrl = "https://www.couverto.fr";
  const toAbsolute = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);
  const fullUrl = url ? toAbsolute(url) : siteUrl;
  const imageUrl = toAbsolute(image);

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
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data (JSON-LD) */}
      {props.jsonLd && <script type="application/ld+json">{JSON.stringify(props.jsonLd)}</script>}
    </Helmet>
  );
};
