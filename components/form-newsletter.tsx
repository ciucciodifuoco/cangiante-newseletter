"use client"

import type React from "react"

import { Form, FormControl, FormField, FormItem, FormMessage, FormStateMessage } from "./ui/form"
import type { NewsletterSchema } from "@/lib/schema"
import { useForm, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { newsletterSchema } from "@/lib/schema"
import { useEffect, useState } from "react"
import { type ActionResult, cn } from "@/lib/utils"
import { AlertTitle, alertVariants } from "./ui/alert"
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import { motion } from "framer-motion"

const SPRING = {
  type: "spring" as const,
  stiffness: 130.4,
  damping: 14.5,
  mass: 1,
}

const SubmissionStateMessage = ({ value, reset }: { value: ActionResult<string> | null; reset: () => void }) => {
  const form = useFormContext<NewsletterSchema>()

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      reset()
    }
  }, [form.formState.errors, reset])

  return (
    <FormStateMessage>
      {value?.success === true && (
        <motion.div
          key={value.id}
          className={cn(alertVariants({ variant: "success" }), "absolute top-0 left-0 right-0 mx-auto w-max")}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING}
        >
          <CheckCircledIcon />
          <AlertTitle>{value.data}</AlertTitle>
        </motion.div>
      )}
    </FormStateMessage>
  )
}

const getDefaultValues = () => {
  if (typeof window !== "undefined") {
    const email = localStorage.getItem("email")
    return { email: email || "" }
  }

  return { email: "" }
}

export const FormNewsletter = ({
  input,
  submit,
}: {
  input: (props: React.ComponentProps<"input">) => React.ReactNode
  submit: (props: React.ComponentProps<"button">) => React.ReactNode
}) => {
  const [submissionState, setSubmissionState] = useState<ActionResult<string> | null>(null)

  const form = useForm<NewsletterSchema>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    return () => {
      const v = form.getValues("email")

      if (v != undefined) {
        localStorage.setItem("email", v)
      }
    }
  }, [form])

  async function onSubmit(values: NewsletterSchema) {
    try {
      // Replace 'YOUR_MAILCHIMP_FORM_ACTION_URL' with your actual Mailchimp form action URL
      // You can get this from your Mailchimp embedded form code
      const MAILCHIMP_URL = process.env.NEXT_PUBLIC_MAILCHIMP_URL || "https://webflow.us12.list-manage.com/subscribe/post?u=6b6ef947658a618da114ee765&amp;id=8d6149ed7d&amp;f_id=000cbde0f0"

      const formData = new FormData()
      formData.append("EMAIL", values.email)

      const response = await fetch(MAILCHIMP_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors", // Mailchimp requires no-cors mode
      })

      // Since we're using no-cors, we can't read the response
      // We'll assume success and show a success message
      setSubmissionState({
        success: true,
        data: "Thank you for subscribing to Cangiante!",
        id: Date.now().toString(),
      })

      form.reset({ email: "" })
    } catch (error) {
      setSubmissionState({
        success: false,
        message: "Something went wrong. Please try again.",
        id: Date.now().toString(),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative pt-10 lg:pt-12">
        <SubmissionStateMessage value={submissionState} reset={() => setSubmissionState(null)} />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormMessage>
                {(error) => (
                  <motion.div
                    key={error}
                    className={cn(
                      alertVariants({ variant: "destructive" }),
                      "absolute top-0 left-0 right-0 mx-auto w-max",
                    )}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={SPRING}
                  >
                    <CrossCircledIcon />
                    <AlertTitle>{error}</AlertTitle>
                  </motion.div>
                )}
              </FormMessage>
              <FormControl>
                <div className="relative">
                  {input({ ...field })}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    {submit({
                      type: "submit",
                      disabled: form.formState.isSubmitting,
                    })}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
