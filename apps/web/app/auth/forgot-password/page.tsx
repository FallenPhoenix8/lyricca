"use client"

import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/form/TextField"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import BlobScene from "@/components/ui/svg/BlobScene"
import APIClient from "@/lib/data/APIClient"
import { cn } from "@/lib/utils"
import { Mail, UserIcon } from "lucide-react"
import { useState } from "react"
import { QueryClient, QueryClientProvider, useMutation } from "react-query"

async function handleForgotPassword(email: string) {
  const result = await APIClient.shared.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
  )
  return result
}

function PageContent() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const { mutate, isLoading, isError } = useMutation(handleForgotPassword, {
    onSuccess: (response) => {
      if (!response.ok) {
        setMessage("Something went wrong.")
        return
      }
      setMessage(response.value.message)
    },
    onError: (error) => {
      console.log("test")
      console.error("Failed to send email:", error)
      setMessage("Something went wrong.")
    },
  })

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
  }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutate(email)
  }
  return (
    <div className="flex">
      <form
        className="flex md:border-2 border-border flex-1 md:flex-none md:mx-auto rounded-lg h-fit mt-10 md:shadow-lg shadow-muted-foreground/10 bg-background dark:bg-secondary/10"
        aria-describedby="sign-in-error"
        onSubmit={handleSubmit}
      >
        <BlobScene className="transform-[scaleX(-1)] h-full w-sm rounded-r-lg rounded-tl-lg hidden md:block border-l border-border" />
        <main className="flex flex-col gap-4 p-4 max-w-xl ">
          <h2 className="app-title-heading">Forgot Password?</h2>
          <p>Enter your email address to reset your password.</p>

          <InputGroup className="w-full">
            <InputGroupInput
              placeholder="example@example.com"
              type="email"
              name="email"
              value={email}
              required
              onChange={handleEmailChange}
            />
            <InputGroupAddon>
              <Mail className="size-5" strokeWidth={"2px"} />
            </InputGroupAddon>
          </InputGroup>
          <Button
            type="submit"
            size="lg"
            variant="default"
            className="max-w flex items-center"
            disabled={false}
          >
            {isLoading && <LoadingSpinner className="w-5 h-5 mr-2" />}
            <div>Send Reset Link</div>
          </Button>
          <p
            className={cn("mt-2 font-bold", isError && "text-destructive")}
            aria-live="polite"
          >
            {message}
          </p>
        </main>
      </form>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <PageContent />
    </QueryClientProvider>
  )
}
