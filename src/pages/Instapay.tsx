import { ArrowRight, Smartphone, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const INSTAPAY_APP_URL = "ipn://S/nadasobhin/instapay/4SSLep";
const INSTAPAY_WEB_URL = "https://ipn.eg/S/nadasobhin/instapay/4SSLep";
const WHATSAPP_URL = "https://wa.me/201505458957";
const WHATSAPP_LABEL = "+20 150 5458957";
const INSTAPAY_LOGO_SRC = "/instapay/instapay-logo.png";
const qrCodeImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(INSTAPAY_APP_URL)}`;

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

const Instapay = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background pb-16 px-4 pt-28 md:pt-32">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-10 md:mb-14 scroll-mt-28">
          <div className="flex flex-col items-center gap-5">
            <div className="w-full flex justify-center overflow-visible py-2">
              <img
                src={INSTAPAY_LOGO_SRC}
                alt="InstaPay"
                className="max-h-14 md:max-h-[4.5rem] w-auto h-auto object-contain object-center block"
                loading="eager"
                decoding="async"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Pay with InstaPay
              </h1>
              <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Pay in the app or scan the QR, then send us a screenshot on WhatsApp so we can confirm your order.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 md:gap-6 md:grid-cols-2">
          <section className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wide mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                1
              </span>
              <Smartphone className="h-4 w-4" aria-hidden />
              <span>App</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Tap to pay</h2>
            <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
              Opens the InstaPay app on your phone if it is installed. On desktop, use your phone or scan the QR on the right.
            </p>
            <Button
              size="lg"
              className="w-full rounded-xl h-12 md:h-14 text-base font-semibold shadow-md touch-manipulation"
              asChild
            >
              <a href={INSTAPAY_APP_URL} className="inline-flex items-center justify-center gap-2">
                Click here to pay
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
              </a>
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <a
                href={INSTAPAY_WEB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Pay in browser instead
              </a>
            </p>
          </section>

          <section className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-6 md:p-8 flex flex-col h-full items-center text-center">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wide mb-4 self-stretch justify-center md:justify-start md:self-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                2
              </span>
              <QrCode className="h-4 w-4" aria-hidden />
              <span>Scan</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 w-full">Scan here</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
              Scan with your phone camera to open this payment in InstaPay.
            </p>
            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-inner border border-border/60 w-full max-w-[280px]">
              <img
                src={qrCodeImageSrc}
                alt="QR code to open this InstaPay payment in the app"
                width={280}
                height={280}
                className="w-full max-w-[240px] h-auto aspect-square object-contain mx-auto"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>
        </div>

        <footer className="mt-10 md:mt-12 rounded-2xl border bg-[#25D366]/10 dark:bg-[#25D366]/15 border-[#25D366]/25 px-5 py-6 md:px-8 md:py-7">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md">
              <WhatsAppGlyph className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <p className="text-sm font-medium text-foreground">After you pay</p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Send a screenshot to WhatsApp{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#128C7E] dark:text-[#25D366] underline underline-offset-2 hover:opacity-90"
                >
                  {WHATSAPP_LABEL}
                </a>
                .
              </p>
            </div>
            <Button variant="secondary" className="shrink-0 touch-manipulation" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Open WhatsApp
              </a>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Instapay;
