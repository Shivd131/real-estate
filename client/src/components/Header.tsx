import React from 'react'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Input, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar } from "@nextui-org/react";
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store';

interface User {
    currentUser: {
        name: string;
        email: string;
        avatar: string;
    }
}

export default function Header() {
    const userDetails = useSelector((state: RootState) => {
        return state.user as unknown as User;
    });

    return (
        <header>
            <Navbar isBordered className='bg-gray-400'>
                <NavbarContent justify="start">
                    <NavbarBrand className="mr-4">
                        {/* <AcmeLogo /> */}
                        <p className="hidden sm:block font-bold text-inherit">HomelyAcres</p>
                    </NavbarBrand>
                    <NavbarContent className="hidden sm:flex gap-3">
                        <NavbarItem>
                            <Link href="/" aria-current="page" color="primary">
                                Home
                            </Link>
                        </NavbarItem>
                        <NavbarItem isActive>
                            <Link href="/about" aria-current="page" color="primary">
                                About
                            </Link>
                        </NavbarItem>
                        <NavbarItem>
                            {!userDetails &&
                                <Link aria-current="page" color="primary" href="/sign-in">
                                    Sign in
                                </Link>
                            }
                        </NavbarItem>
                    </NavbarContent>
                </NavbarContent>

                <NavbarContent as="div" className="items-center" justify="end">
                    <Input
                        classNames={{
                            base: "max-w-full sm:max-w-[20rem] h-10",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper: "h-full font-normal text-default-900 bg-default-500/20 dark:bg-default-600/20",
                        }}
                        placeholder="Search..."
                        size="sm"
                        //startContent={<SearchIcon size={18} />}
                        type="search"
                    />
                    {userDetails &&
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar
                                    isBordered
                                    as="button"
                                    className="transition-transform"
                                    color="secondary"
                                    name={userDetails?.currentUser?.name}
                                    size="sm"
                                    src={userDetails?.currentUser?.avatar}
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Profile Actions" variant="flat">
                                <DropdownItem key="profile" className="h-14 gap-2">
                                    <p className="font-semibold">Signed in as</p>
                                    <p className="font-semibold">{userDetails?.currentUser?.email}</p>
                                </DropdownItem>
                                <DropdownItem key="settings">My Settings</DropdownItem>
                                <DropdownItem key="profile">
                                    <Link href="/profile">
                                        View Profile
                                    </Link>
                                </DropdownItem>
                                <DropdownItem key="configurations">Configurations</DropdownItem>
                                <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                                <DropdownItem key="logout" color="danger">
                                    Log Out
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    }

                </NavbarContent>
            </Navbar>
        </header>
    )
}
