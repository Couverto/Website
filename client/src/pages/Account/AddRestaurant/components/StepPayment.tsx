import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { useTranslation } from "react-i18next";
import { CreditCard, Calendar, Lock } from "lucide-react";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useState } from "react";
import { StepProps } from "@/interfaces/Components";

export const StepPayment = ({ data, updateData, errors }: StepProps) => {
  const { t } = useTranslation();
  const [focus, setFocus] = useState<any>("");

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    updateData({ cardNumber: value });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    updateData({ expiry: value });
  };

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    updateData({ cvc: value });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(e.target.name);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-center py-4">
          <Cards
            number={data.cardNumber || ""}
            expiry={data.expiry || ""}
            cvc={data.cvc || ""}
            name={data.cardHolder || ""}
            focused={focus}
          />
        </div>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label
              htmlFor="cardHolder"
              className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.cardHolder ? "text-red-500" : ""}`}
            >
              {t("create.steps.payment.card_holder")}
            </Label>
            <Input
              id="cardHolder"
              name="name" // react-credit-cards-2 expects 'name' for focus
              placeholder={t("create.steps.payment.card_holder_placeholder")}
              className={`uppercase h-12 text-base transition-all ${errors?.cardHolder ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
              value={data.cardHolder || ""}
              onChange={(e) => updateData({ cardHolder: e.target.value.toUpperCase() })}
              onFocus={handleInputFocus}
            />
            {errors?.cardHolder && <p className="text-xs font-medium text-red-500 px-1">{errors.cardHolder}</p>}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="cardNumber"
              className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.cardNumber ? "text-red-500" : ""}`}
            >
              {t("create.steps.payment.card_number")}
            </Label>
            <div className="relative group">
              <CreditCard
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.cardNumber ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <Input
                id="cardNumber"
                name="number"
                placeholder="0000 0000 0000 0000"
                className={`pl-10 h-12 text-base transition-all ${errors?.cardNumber ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
                value={data.cardNumber || ""}
                onChange={handleCardNumberChange}
                onFocus={handleInputFocus}
              />
            </div>
            {errors?.cardNumber && <p className="text-xs font-medium text-red-500 px-1">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="expiry"
                className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.expiry ? "text-red-500" : ""}`}
              >
                {t("create.steps.payment.expiry")}
              </Label>
              <div className="relative group">
                <Calendar
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.expiry ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
                />
                <Input
                  id="expiry"
                  name="expiry"
                  placeholder={t("create.steps.payment.expiry_placeholder")}
                  className={`pl-10 h-12 text-base transition-all ${errors?.expiry ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
                  value={data.expiry || ""}
                  onChange={handleExpiryChange}
                  onFocus={handleInputFocus}
                />
              </div>
              {errors?.expiry && <p className="text-xs font-medium text-red-500 px-1">{errors.expiry}</p>}
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="cvc"
                className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.cvc ? "text-red-500" : ""}`}
              >
                {t("create.steps.payment.cvc")}
              </Label>
              <div className="relative group">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.cvc ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
                />
                <Input
                  id="cvc"
                  name="cvc"
                  placeholder="123"
                  type="tel"
                  className={`pl-10 h-12 text-base transition-all ${errors?.cvc ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
                  value={data.cvc || ""}
                  onChange={handleCVCChange}
                  onFocus={handleInputFocus}
                  maxLength={4}
                />
              </div>
              {errors?.cvc && <p className="text-xs font-medium text-red-500 px-1">{errors.cvc}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex flex-col items-center gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-200 shadow-inner">
            <Lock className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-emerald-900 tracking-tight">{t("create.steps.payment.secure_text")}</p>
            <p className="text-[10px] text-emerald-700/60 leading-relaxed font-medium uppercase tracking-widest">
              {t("create.steps.payment.secure_text_detail")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
