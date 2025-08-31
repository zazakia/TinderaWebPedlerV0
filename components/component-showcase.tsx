// components/component-showcase.tsx
"use client";

import React from 'react';
import { ArrowLeft } from "lucide-react";

// Import all components from components/ui
import { Accordion } from "@/components/ui/accordion";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Alert } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { Chart } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible } from "@/components/ui/collapsible";
import { Command } from "@/components/ui/command";
import { ContextMenu } from "@/components/ui/context-menu";
import { CustomerManager } from "@/components/ui/customer-manager";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { HoverCard } from "@/components/ui/hover-card";
import { InputOTP } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { InventoryManager } from "@/components/ui/inventory-manager";
import { Label } from "@/components/ui/label";
import { Menubar } from "@/components/ui/menubar";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Pagination } from "@/components/ui/pagination";
import { PaymentProcessor } from "@/components/ui/payment-processor";
import { Popover } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";
import { ReceiptGenerator } from "@/components/ui/receipt-generator";
import { ReportsDashboard } from "@/components/ui/reports-dashboard";
import { Resizable } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Sonner } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Table } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip } from "@/components/ui/tooltip";

// Import components from components/
import { AddProduct } from "@/components/add-product";
import { PosIntegration } from "@/components/pos-integration";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";


interface ComponentShowcaseProps {
  onBack: () => void;
}

const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 bg-purple-600 text-white flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onBack} />
          <h1 className="text-lg font-bold">Component Showcase</h1>
        </div>

        <div className="p-4 space-y-8">
          {/* Components from components/ui */}
          <div>
            <h2 className="text-xl font-semibold mb-2">UI Components</h2>
            <div className="space-y-4">
              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Accordion</h3>
                <Accordion type="single" collapsible>
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
                    <Accordion.Content>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Alert Dialog</h3>
                <AlertDialog>
                  <AlertDialog.Trigger asChild>
                    <Button variant="outline">Show Dialog</Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content>
                    <AlertDialog.Header>
                      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                      <AlertDialog.Description>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                      <AlertDialog.Action>Continue</AlertDialog.Action>
                    </AlertDialog.Footer>
                  </AlertDialog.Content>
                </AlertDialog>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Alert</h3>
                <Alert>
                  <Alert.Title>Heads up!</Alert.Title>
                  <Alert.Description>
                    You can add components to your app using the cli.
                  </Alert.Description>
                </Alert>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">AspectRatio</h3>
                <AspectRatio ratio={16 / 9} className="bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">16:9 Aspect Ratio</span>
                </AspectRatio>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Avatar</h3>
                <Avatar>
                  <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
                  <Avatar.Fallback>CN</Avatar.Fallback>
                </Avatar>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Badge</h3>
                <Badge>Badge</Badge>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">BarcodeScanner</h3>
                {/* BarcodeScanner requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">BarcodeScanner component (requires props)</p>
                {/* <BarcodeScanner onScan={() => {}} /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Breadcrumb</h3>
                <Breadcrumb>
                  <Breadcrumb.List>
                    <Breadcrumb.Item>
                      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                      <Breadcrumb.Page>Components</Breadcrumb.Page>
                    </Breadcrumb.Item>
                  </Breadcrumb.List>
                </Breadcrumb>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Button</h3>
                <Button>Button</Button>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Calendar</h3>
                {/* Calendar requires state, rendering a placeholder */}
                <p className="text-sm text-gray-500">Calendar component (requires state)</p>
                {/* <Calendar mode="single" selected={new Date()} onSelect={() => {}} initialFocus /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Card</h3>
                <Card>
                  <Card.Header>
                    <Card.Title>Card Title</Card.Title>
                    <Card.Description>Card Description</Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <p>Card Content</p>
                  </Card.Content>
                  <Card.Footer>
                    <p>Card Footer</p>
                  </Card.Footer>
                </Card>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Carousel</h3>
                {/* Carousel requires items, rendering a placeholder */}
                <p className="text-sm text-gray-500">Carousel component (requires items)</p>
                {/* <Carousel>...</Carousel> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Chart</h3>
                {/* Chart requires data, rendering a placeholder */}
                <p className="text-sm text-gray-500">Chart component (requires data)</p>
                {/* <Chart /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Checkbox</h3>
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="ml-2">Accept terms and conditions</Label>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Collapsible</h3>
                <Collapsible>
                  <Collapsible.Trigger asChild>
                    <Button variant="outline">Toggle</Button>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    Content goes here.
                  </Collapsible.Content>
                </Collapsible>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Command</h3>
                {/* Command requires state/logic, rendering a placeholder */}
                <p className="text-sm text-gray-500">Command component (requires state/logic)</p>
                {/* <Command>...</Command> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">ContextMenu</h3>
                {/* ContextMenu requires trigger, rendering a placeholder */}
                <p className="text-sm text-gray-500">ContextMenu component (requires trigger)</p>
                {/* <ContextMenu>...</ContextMenu> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">CustomerManager</h3>
                {/* CustomerManager requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">CustomerManager component (requires props)</p>
                {/* <CustomerManager /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Dialog</h3>
                <Dialog>
                  <Dialog.Trigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
                      <Dialog.Description>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Footer>
                      <Button variant="outline">Cancel</Button>
                      <Button>Continue</Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Drawer</h3>
                {/* Drawer requires trigger, rendering a placeholder */}
                <p className="text-sm text-gray-500">Drawer component (requires trigger)</p>
                {/* <Drawer>...</Drawer> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">DropdownMenu</h3>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="outline">Open</Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Label>My Account</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>Profile</DropdownMenu.Item>
                    <DropdownMenu.Item>Billing</DropdownMenu.Item>
                    <DropdownMenu.Item>Team</DropdownMenu.Item>
                    <DropdownMenu.Item>Subscription</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Form</h3>
                {/* Form requires useForm hook, rendering a placeholder */}
                <p className="text-sm text-gray-500">Form component (requires useForm)</p>
                {/* <Form {...form}>...</Form> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">HoverCard</h3>
                <HoverCard>
                  <HoverCard.Trigger asChild>
                    <Button variant="link">@nextjs</Button>
                  </HoverCard.Trigger>
                  <HoverCard.Content className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <Avatar.Image src="https://github.com/vercel.png" />
                        <Avatar.Fallback>VC</Avatar.Fallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@nextjs</h4>
                        <p className="text-sm">
                          The React Framework for the Web
                        </p>
                        <div className="flex items-center pt-2">
                          <Calendar className="mr-2 h-4 w-4 opacity-70" />{" "}
                          <span className="text-xs text-muted-foreground">
                            Joined December 2021
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCard.Content>
                </HoverCard>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">InputOTP</h3>
                {/* InputOTP requires state, rendering a placeholder */}
                <p className="text-sm text-gray-500">InputOTP component (requires state)</p>
                {/* <InputOTP maxLength={6} /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Input</h3>
                <Input placeholder="Text input" />
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">InventoryManager</h3>
                {/* InventoryManager requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">InventoryManager component (requires props)</p>
                {/* <InventoryManager /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Label</h3>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Menubar</h3>
                {/* Menubar requires items, rendering a placeholder */}
                <p className="text-sm text-gray-500">Menubar component (requires items)</p>
                {/* <Menubar>...</Menubar> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">NavigationMenu</h3>
                {/* NavigationMenu requires items, rendering a placeholder */}
                <p className="text-sm text-gray-500">NavigationMenu component (requires items)</p>
                {/* <NavigationMenu>...</NavigationMenu> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Pagination</h3>
                {/* Pagination requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">Pagination component (requires props)</p>
                {/* <Pagination>...</Pagination> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">PaymentProcessor</h3>
                {/* PaymentProcessor requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">PaymentProcessor component (requires props)</p>
                {/* <PaymentProcessor /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Popover</h3>
                <Popover>
                  <Popover.Trigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </Popover.Trigger>
                  <Popover.Content className="w-80">
                    This is the popover content.
                  </Popover.Content>
                </Popover>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Progress</h3>
                <Progress value={50} className="w-[60%]" />
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">RadioGroup</h3>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroup.Item value="default" id="r1" />
                    <Label htmlFor="r1">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroup.Item value="comfortable" id="r2" />
                    <Label htmlFor="r2">Comfortable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroup.Item value="compact" id="r3" />
                    <Label htmlFor="r3">Compact</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">ReceiptGenerator</h3>
                {/* ReceiptGenerator requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">ReceiptGenerator component (requires props)</p>
                {/* <ReceiptGenerator /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">ReportsDashboard</h3>
                {/* ReportsDashboard requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">ReportsDashboard component (requires props)</p>
                {/* <ReportsDashboard /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Resizable</h3>
                {/* Resizable requires children, rendering a placeholder */}
                <p className="text-sm text-gray-500">Resizable component (requires children)</p>
                {/* <Resizable.PanelGroup direction="horizontal">...</Resizable.PanelGroup> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">ScrollArea</h3>
                <ScrollArea className="h-[100px] w-[200px] rounded-md border p-4">
                  Jokester began his career writing jokes for late-night talk show hosts.
                  He then moved on to write for various comedy specials and sitcoms.
                  His work has been featured on Netflix, Comedy Central, and HBO.
                </ScrollArea>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Select</h3>
                <Select>
                  <Select.Trigger className="w-[180px]">
                    <Select.Value placeholder="Select a fruit" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Fruits</Select.Label>
                      <Select.Item value="apple">Apple</Select.Item>
                      <Select.Item value="banana">Banana</Select.Item>
                      <Select.Item value="blueberry">Blueberry</Select.Item>
                      <Select.Item value="grapes">Grapes</Select.Item>
                      <Select.Item value="pineapple">Pineapple</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Separator</h3>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
                  <p className="text-sm text-muted-foreground">
                    An open-source UI component library.
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="flex h-5 items-center space-x-4 text-sm">
                  <div>Blog</div>
                  <Separator orientation="vertical" />
                  <div>Docs</div>
                  <Separator orientation="vertical" />
                  <div>Source</div>
                </div>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Sheet</h3>
                {/* Sheet requires trigger, rendering a placeholder */}
                <p className="text-sm text-gray-500">Sheet component (requires trigger)</p>
                {/* <Sheet>...</Sheet> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Sidebar</h3>
                {/* Sidebar requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">Sidebar component (requires props)</p>
                {/* <Sidebar /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Skeleton</h3>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Slider</h3>
                <Slider defaultValue={[50]} max={100} step={1} className="w-[60%]" />
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Sonner</h3>
                {/* Sonner requires usage with toast, rendering a placeholder */}
                <p className="text-sm text-gray-500">Sonner component (requires usage with toast)</p>
                {/* <Sonner /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Switch</h3>
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode" className="ml-2">Airplane Mode</Label>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Table</h3>
                {/* Table requires data, rendering a placeholder */}
                <p className="text-sm text-gray-500">Table component (requires data)</p>
                {/* <Table>...</Table> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Tabs</h3>
                <Tabs defaultValue="account" className="w-[400px]">
                  <Tabs.List>
                    <Tabs.Trigger value="account">Account</Tabs.Trigger>
                    <Tabs.Trigger value="password">Password</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="account">
                    Make changes to your account here.
                  </Tabs.Content>
                  <Tabs.Content value="password">
                    Change your password here.
                  </Tabs.Content>
                </Tabs>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Textarea</h3>
                <Textarea placeholder="Type your message here." />
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Toast</h3>
                {/* Toast requires usage with useToast hook, rendering a placeholder */}
                <p className="text-sm text-gray-500">Toast component (requires usage with useToast)</p>
                {/* <Toast /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Toaster</h3>
                {/* Toaster requires usage with useToast hook, rendering a placeholder */}
                <p className="text-sm text-gray-500">Toaster component (requires usage with useToast)</p>
                {/* <Toaster /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">ToggleGroup</h3>
                <ToggleGroup type="single" defaultValue="center">
                  <ToggleGroup.Item value="left" aria-label="Toggle bold">
                    Left
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="center" aria-label="Toggle italic">
                    Center
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="right" aria-label="Toggle underline">
                    Right
                  </ToggleGroup.Item>
                </ToggleGroup>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Toggle</h3>
                <Toggle aria-label="Toggle italic">
                  Italic
                </Toggle>
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Tooltip</h3>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant="outline">Hover</Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Add to library</p>
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Components from components/ */}
          <div>
            <h2 className="text-xl font-semibold mb-2">General Components</h2>
            <div className="space-y-4">
              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">AddProduct</h3>
                {/* AddProduct requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">AddProduct component (requires props)</p>
                {/* <AddProduct onBack={() => {}} categories={[]} onSave={() => {}} /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">PosIntegration</h3>
                {/* PosIntegration requires props, rendering a placeholder */}
                <p className="text-sm text-gray-500">PosIntegration component (requires props)</p>
                {/* <PosIntegration /> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">Providers</h3>
                {/* Providers is likely a wrapper, rendering a placeholder */}
                <p className="text-sm text-gray-500">Providers component (likely a wrapper)</p>
                {/* <Providers>...</Providers> */}
              </div>

              <div className="border p-3 rounded-lg">
                <h3 className="font-medium mb-2">ThemeProvider</h3>
                {/* ThemeProvider is likely a wrapper, rendering a placeholder */}
                <p className="text-sm text-gray-500">ThemeProvider component (likely a wrapper)</p>
                {/* <ThemeProvider>...</ThemeProvider> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;
