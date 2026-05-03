import { ArrowRight, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const INSTAPAY_APP_URL = "ipn://S/nadasobhin/instapay/4SSLep";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background pb-16 pt-6 md:pt-8">
      <header className="mb-8 border-b border-border/50 bg-muted/40 md:mb-10">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 md:py-10">
          <div className="flex w-full items-center justify-center leading-none">
            <img
              src={INSTAPAY_LOGO_SRC}
              alt="InstaPay"
              className="block h-auto w-full max-w-[280px] shrink-0 object-contain sm:max-w-[300px]"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Pay with InstaPay
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Use either option below, then send us a payment screenshot on WhatsApp so we can confirm your order.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
          <section className="flex flex-1 flex-col rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Click here</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              Opens the InstaPay app on your device when it is installed.
            </p>
            <Button
              size="lg"
              className="mt-6 h-12 w-full touch-manipulation rounded-xl text-base font-semibold shadow-md md:h-14"
              asChild
            >
              <a href={INSTAPAY_APP_URL} className="inline-flex items-center justify-center gap-2">
                Click here
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
              </a>
            </Button>
          </section>

          <div className="flex items-center justify-center gap-3 py-1 md:self-center md:py-2">
            <div className="h-px flex-1 bg-border md:hidden" />
            <span className="shrink-0 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border md:hidden" />
          </div>

          <section className="flex flex-1 flex-col items-center rounded-2xl border bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm md:items-stretch md:p-8 md:text-left">
            <h2 className="flex w-full items-center justify-center gap-2 text-lg font-semibold text-foreground md:justify-start md:text-xl">
              <QrCode className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              Scan
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground md:mx-0 md:text-left">
              Scan this code with your phone camera to open the same payment in InstaPay.
            </p>
            <div className="mt-6 w-full max-w-[260px] self-center rounded-2xl border border-border/60 bg-white p-4 shadow-inner sm:p-5">
              <img
                src={qrCodeImageSrc}
                alt="QR code for InstaPay payment"
                width={280}
                height={280}
                className="mx-auto aspect-square w-full max-w-[240px] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>
        </div>

        <footer className="mt-10 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/10 px-5 py-6 dark:bg-[#25D366]/15 md:mt-12 md:px-8 md:py-7">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md">
              <WhatsAppGlyph className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-2">
              <p className="text-sm font-medium text-foreground">After you pay</p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Send a screenshot to{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#128C7E] underline underline-offset-2 hover:opacity-90 dark:text-[#25D366]"
                >
                  {WHATSAPP_LABEL}
                </a>
                . The button below opens in WhatsApp and goes straight to the chat with this number.
              </p>
            </div>
            <Button variant="secondary" className="shrink-0 touch-manipulation" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Open in WhatsApp
              </a>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Instapay;
