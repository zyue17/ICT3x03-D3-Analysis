######################################## REGISTER Enitity##################################
class otp:
    def __init__(self, randomtop):
        self.randomtop = randomtop

    def savingrandomotp(self, randomtop):
        self.randomtop = randomtop

    def checkingrandomotp(self, Usercode):
        if self.randomtop == Usercode:
            return True
        else:
            return False


dualotp = otp("")